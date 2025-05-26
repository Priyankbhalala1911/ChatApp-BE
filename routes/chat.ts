import { Router } from "express";
import { UserAuth } from "../middleware/auth";
import { Chat } from "../controller/chat";

const router = Router();

router.post("/", UserAuth, Chat);

export default router;
