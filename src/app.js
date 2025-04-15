import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { API_BASE_URL } from "../config/env.config.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import errorRouter from "./routes/error.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

//routes
app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/user`, userRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the super-secure jwt-auth API Service",
    maintainer: "@durjoydutta",
    API_BASE_URL: `${API_BASE_URL}`,
  });
});

app.use(errorRouter);

export default app;
