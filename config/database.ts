import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/user";
import { Message } from "../models/message";
import { Conversation } from "../models/conversation";
import "dotenv/config";
import { initialSocketServer } from "./socket";

export const AppDataSourse = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: ["models/*.ts"],
  ssl: {
    rejectUnauthorized: true,
  },
  migrations: ["migrations/*.js"],
});

export const intializeDatabase = async () => {
  try {
    await AppDataSourse.initialize();
    initialSocketServer();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.log("Error connecting to the database", error);
  }
};
