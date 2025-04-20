import { Router } from "express";
import {
  signIn,
  signOut,
  signUp,
  verifyOTP,
  sendVerificationMail,
  sendPasswordResetMail,
  verifyPasswordResetOTP,
  isAuthenticated,
  refreshToken,
} from "../controllers/auth.controller.js";
import authMiddleWare from "../middlewares/auth.middleware.js";
import differentiateEmailUsername from "../middlewares/differentiateEmailUsername.middleware.js";

const authRouter = Router();

authRouter.route("/sign-up").post(signUp);
authRouter.route("/sign-in").post(signIn);
authRouter.route("/sign-out").post(authMiddleWare, signOut);
authRouter.route("/refresh").post(refreshToken); // Add this new route for refreshing tokens
authRouter.route("/is-auth").get(authMiddleWare, isAuthenticated);
authRouter
  .route("/verification-mail")
  .post(authMiddleWare, sendVerificationMail);
authRouter.route("/verify-otp").post(authMiddleWare, verifyOTP);
authRouter
  .route("/reset-password")
  .post(differentiateEmailUsername, sendPasswordResetMail);
authRouter.route("/verify-reset-password").post(verifyPasswordResetOTP);

export default authRouter;
