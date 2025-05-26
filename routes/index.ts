import { Router } from "express";
import authRoutes from "./auth";
import chatRoutes from "./chat";
import conversationRoutes from "./conversation";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/conversation", conversationRoutes);

export default router;
