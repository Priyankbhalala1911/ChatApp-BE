import { Request, Response } from "express";
import { User } from "../models/user";
import { AppDataSourse } from "../config/database";
import { validate } from "class-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateRandomImage } from "../utils/randomImage";
import { ILike } from "typeorm";

const UserRepo = AppDataSourse.getRepository(User);

export const registration = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userFound = await UserRepo.findOne({ where: { email } });
    if (userFound) {
      res.status(400).json({ message: "User already Exists" });
      return;
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.profileImage = generateRandomImage();

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json({
        message: "validation failed..",
        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints!)[0],
        })),
      });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;

    const result = await UserRepo.save(user);
    res.json({ message: "Registration Succeessfully", result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
    return;
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and Password are required" });
      return;
    }

    const userFound = await UserRepo.findOne({ where: { email } });
    if (!userFound) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: userFound.id },
      process.env.JWT_SCERET_KEY as string,
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login Successfully", user: userFound });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).json({ message: "Token are not provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SCERET_KEY as string) as {
      id: string;
      name: string;
    };

    const user = await UserRepo.findOne({ where: { id: decoded.id } });
    if (!user) {
      res.status(400).json({ message: "user are unauthorized" });
      return;
    }

    res.status(200).json({ token: token, user: user });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out Successfully" });
    return;
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (name) {
      const users = await UserRepo.find({
        where: { name: ILike(`%${name}%`) },
      });

      if (users.length === 0) {
        res.status(404).json({ message: "No users found with that name" });
        return;
      }

      res.status(200).json({ users });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
    return;
  }
};
