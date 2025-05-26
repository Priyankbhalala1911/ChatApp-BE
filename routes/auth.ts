import { Router } from "express";
import {
  loginUser,
  registration,
  getToken,
  logout,
  getUser,
} from "../controller/user";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registration);
router.get("/token", getToken);
router.get("/logout", logout);
router.get("/user", getUser);

export default router;
