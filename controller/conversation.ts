import { AppDataSourse } from "../config/database";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { User } from "../models/user";
import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const conversations = await AppDataSourse.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .innerJoinAndSelect("conversation.users", "user")
      .innerJoinAndSelect("conversation.messages", "message")
      .where("user.id = :userId", { userId })
      .orderBy("message.crearedAt", "ASC")
      .getMany();

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
};

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const conversation = await AppDataSourse.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .innerJoinAndSelect("conversation.users", "user")
      .where("conversation.id = :conversationId", { conversationId })
      .andWhere("user.id = :userId", { userId })
      .getOne();

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

    const messages = await AppDataSourse.getRepository(Message)
      .createQueryBuilder("message")
      .innerJoinAndSelect("message.sender", "sender")
      .innerJoinAndSelect("message.receiver", "receiver")
      .where("message.conversationId = :conversationId", { conversationId })
      .orderBy("message.crearedAt", "ASC")
      .getMany();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
};
