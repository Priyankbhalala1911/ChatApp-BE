import { Router } from "express";
import { UserAuth } from "../middleware/auth";
import { getConversations, getMessages } from "../controller/conversation";

const router = Router();

router.get("/", UserAuth, getConversations);
router.get("/:id/messages", UserAuth, getMessages);

export default router;
