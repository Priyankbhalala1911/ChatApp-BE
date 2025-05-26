import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { AppDataSourse } from "../config/database";

interface AuthenticatedRequest extends Request {
  cookies: {
    token: string;
  };
  user?: User;
}

export const UserAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req?.cookies?.token;
    if (!token) {
      res.status(401).json({ error: "User unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SCERET_KEY as string) as {
      id: string;
      name: string;
    };

    const user = await AppDataSourse.getRepository(User).findOne({
      where: { id: decoded.id },
    });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
