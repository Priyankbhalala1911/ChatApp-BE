import express from "express";
import router from "./routes";
import "dotenv/config";
import { intializeDatabase } from "./config/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./config/socket";

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api", router);

intializeDatabase();
server.listen(8000, () => console.log("Server Started on the port 8000"));
