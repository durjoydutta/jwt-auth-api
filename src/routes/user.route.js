import { Router } from "express";
import { getUser, updateUser } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validateUser } from "../middlewares/validation.middleware.js";

const userRouter = Router();

// TO-DO: add user routes here