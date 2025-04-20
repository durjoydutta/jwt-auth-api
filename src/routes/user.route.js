import { Router } from "express";
import {
  getSelf,
  getUserById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  undeleteUser,
  getDeletedUsers,
} from "../controllers/user.controller.js";
import authMiddleWare from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";

const userRouter = Router();

userRouter.route("/data").get(authMiddleWare, getSelf);
userRouter.route("/all").get(authMiddleWare, isAdmin, getAllUsers);
userRouter.route("/deleted").get(authMiddleWare, isAdmin, getDeletedUsers);
userRouter.route("/delete/:id").delete(authMiddleWare, isAdmin, deleteUser);
userRouter.route("/undelete/:id").patch(authMiddleWare, isAdmin, undeleteUser);
userRouter
  .route("/update/role/:id")
  .patch(authMiddleWare, isAdmin, updateUserRole);
userRouter.route("/:id").get(authMiddleWare, isAdmin, getUserById);

export default userRouter;
