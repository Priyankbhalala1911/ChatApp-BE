import { Router } from "express";
import { UserAuth } from "../middleware/auth";
import {
  getReceiversMessagedByUser,
  getConversations,
  getMessages,
} from "../controller/conversation";

const router = Router();

router.get("/", UserAuth, getReceiversMessagedByUser);
router.get("/id", UserAuth, getConversations);
router.get("/:conversationId/messages", UserAuth, getMessages);

export default router;
