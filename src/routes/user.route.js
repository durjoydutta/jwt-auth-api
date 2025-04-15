import { Router } from "express";
import { getSelf, getUserById, getAllUsers, updateUserRole, deleteUser } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js"; // validates if user is authorized by checking the JWT token
import isAdmin from "../middlewares/isAdmin.middleware.js"; // checks if the user is an admin

const userRouter = Router();

userRouter.route("/data").get(auth, getSelf); //get self userdata
userRouter.route("/all").get(auth, isAdmin, getAllUsers); // get all userdata : admin
userRouter.route("/delete/:id").delete(auth, isAdmin, deleteUser); // delete user by id 
userRouter.route("/update/role/:id").patch(auth, isAdmin, updateUserRole); // update user role by id
userRouter.route("/:id").get(auth, isAdmin, getUserById); // get user by id 

export default userRouter;
