import { AppDataSourse } from "../config/database";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { User } from "../models/user";
import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const getReceiversMessagedByUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access",
      });
      return;
    }

    const messages = await AppDataSourse.getRepository(Message)
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.receiver", "receiver")
      .where("message.sender.id = :userId", { userId })
      .getMany();

    if (!messages || messages.length === 0) {
      res.status(404).json({
        success: false,
        error: "No sent messages found",
      });
      return;
    }

    const uniqueReceiversMap = new Map<string, User>();
    messages.forEach((msg) => {
      if (msg.receiver && !uniqueReceiversMap.has(msg.receiver.id)) {
        uniqueReceiversMap.set(msg.receiver.id, msg.receiver);
      }
    });

    const uniqueReceivers = Array.from(uniqueReceiversMap.values());

    res.status(200).json({
      success: true,
      data: uniqueReceivers,
    });
  } catch (error) {
    console.error("Error fetching receivers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch receivers",
    });
  }
};

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { receiverId } = req.query;
    const senderId = req.user?.id;

    if (!senderId || !receiverId) {
      res.status(400).json({
        success: false,
        error: "Sender ID and Receiver ID are required.",
      });
      return;
    }

    const conversation = await AppDataSourse.getRepository(Conversation)
      .createQueryBuilder("conversation")
      .innerJoin("conversation.users", "user")
      .where("user.id IN (:...userIds)", {
        userIds: [senderId, receiverId],
      })
      .groupBy("conversation.id")
      .having("COUNT(DISTINCT user.id) = 2")
      .getOne();

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: conversation,
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
      .orderBy("message.createdAt", "ASC")
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
