import express from "express";
import http from "http";
import { Server } from "socket.io";
import { AppDataSourse } from "./database";
import { User } from "../models/user";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const onlineUsers = new Map<string, string>();

export const initialSocketServer = () => {
  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("user_online", async (userId: string) => {
      try {
        onlineUsers.set(userId, socket.id);

        const userRepo = AppDataSourse.getRepository(User);
        await userRepo.update(userId, { isOnline: true });

        io.emit("user_status_changed", { userId, isOnline: true });

        console.log(`User ${userId} is now online`);
      } catch (err) {
        console.error("Error handling user online:", err);
      }
    });

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);
    });

    socket.on("typing", ({ receiverId, userId }) => {
      socket.to(receiverId).emit("typing", { receiverId, userId });
    });

    socket.on("stoptyping", ({ receiverId, userId }) => {
      socket.to(receiverId).emit("stoptyping", { receiverId, userId });
    });

    socket.on("sent_message", async ({ senderId, receiverId, text }) => {
      try {
        if (!text?.trim() || !receiverId) return;

        const userRepo = AppDataSourse.getRepository(User);
        const convRepo = AppDataSourse.getRepository(Conversation);
        const msgRepo = AppDataSourse.getRepository(Message);

        const sender = await userRepo.findOneBy({ id: senderId });
        const receiver = await userRepo.findOneBy({ id: receiverId });

        if (!sender || !receiver) return;

        let conversation = await convRepo
          .createQueryBuilder("conversation")
          .innerJoin("conversation.users", "user")
          .where("user.id IN (:...userIds)", {
            userIds: [senderId, receiverId],
          })
          .groupBy("conversation.id")
          .having("COUNT(DISTINCT user.id) = 2")
          .getOne();

        if (!conversation) {
          conversation = new Conversation();
          conversation.isGroup = false;
          conversation.users = [sender, receiver];
          await convRepo.save(conversation);
        } else {
          conversation.lastMessage = text;
          conversation.lastMessageTime = new Date().toISOString();
          await convRepo.save(conversation);
        }

        const message = new Message();
        message.text = text;
        message.sender = sender;
        message.receiver = receiver;
        message.conversation = conversation;
        await msgRepo.save(message);

        const payload = {
          ...message,
          createdAt: new Date().toISOString(),
        };

        io.to(senderId.toString()).emit("received_message", payload);
        io.to(receiverId.toString()).emit("received_message", payload);
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("message_seen", async ({ messageId }) => {
      const messageRepo = AppDataSourse.getRepository(Message);

      const message = await messageRepo.findOne({
        where: { id: messageId },
        relations: ["sender", "receiver"],
      });

      if (!message) return;

      if (!message.seen) {
        message.seen = true;
        await messageRepo.save(message);
      }

      io.to(message.sender?.id).emit("message_seen_update", {
        messageId,
      });
    });

    socket.on("disconnect", async () => {
      try {
        let disconnectedUserId: string | undefined;
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            break;
          }
        }

        if (disconnectedUserId) {
          const userRepo = AppDataSourse.getRepository(User);
          await userRepo.update(disconnectedUserId, { isOnline: false });

          onlineUsers.delete(disconnectedUserId);

          io.emit("user_status_changed", {
            userId: disconnectedUserId,
            isOnline: false,
          });

          console.log(`User ${disconnectedUserId} disconnected`);
        }
      } catch (err) {
        console.error("Error handling disconnection:", err);
      }
    });
  });
};

export { app, server, io };
