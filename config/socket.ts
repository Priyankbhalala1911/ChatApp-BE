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
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

export const initialSocketServer = () => {
  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("join", (userId) => {
      console.log("user joined room", userId);
      socket.join(userId);
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
        }

        const message = new Message();
        message.text = text;
        message.sender = sender;
        message.receiver = receiver;
        message.conversation = conversation;
        await msgRepo.save(message);

        const payload = {
          ...message,
          createdAt: message.createdAt.toISOString(),
        };

        io.to(senderId.toString()).emit("received_message", payload);
        io.to(receiverId.toString()).emit("received_message", payload);
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });
  });
};
export { app, server, io };
