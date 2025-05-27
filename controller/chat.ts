import { Request, Response } from "express";
import { User } from "../models/user";
import { AppDataSourse } from "../config/database";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { io } from "../config/socket";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const Chat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, receiverId } = req.body;
    const userId = req.user?.id;

    if (!text?.trim()) {
      res.status(400).json({
        success: false,
        error: "Message content cannot be empty",
      });
      return;
    }

    if (!receiverId) {
      res.status(400).json({
        success: false,
        error: "Receiver ID is required",
      });
      return;
    }

    const sender = await AppDataSourse.getRepository(User).findOne({
      where: {
        id: userId,
      },
    });

    if (!sender) {
      res.status(401).json({
        success: false,
        error: "User is unauthorized",
      });
      return;
    }

    const receiver = await AppDataSourse.getRepository(User).findOne({
      where: {
        id: receiverId,
      },
    });

    if (!receiver) {
      res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
      return;
    }

    const existingConversation = await AppDataSourse.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .innerJoin("conversation.users", "user")
      .where("user.id IN (:...userIds)", {
        userIds: [userId, receiverId],
      })
      .groupBy("conversation.id")
      .having("COUNT(DISTINCT user.id) = 2")
      .getOne();

    let conversation: Conversation;

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      conversation = new Conversation();
      conversation.isGroup = false;
      conversation.users = [sender, receiver];
      await AppDataSourse.getRepository(Conversation).save(conversation);
    }

    const message = new Message();
    message.text = text;
    message.sender = sender;
    message.receiver = receiver;
    message.conversation = conversation;

    await AppDataSourse.getRepository(Message).save(message);

    io.to(receiverId).emit("received_message", {
      ...message,
      createdAt: message.createdAt.toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message,
        conversation,
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
};
