import { Router } from "express";
import {
  signIn,
  signOut,
  signUp,
  verifyOTP,
  sendVerificationEmail,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.route("/sign-up").post(signUp);
authRouter.route("/verify-otp").post(verifyOTP);
authRouter.route("/send-verification-email").post(sendVerificationEmail);
// authRouter.route('/resend-otp').post(resendOTP);
// authRouter.route('/forgot-password').post(forgotPassword);
// authRouter.route('/reset-password').post(resetPassword);
authRouter.route("/sign-in").post(signIn);
authRouter.route("/sign-out").post(signOut);

export default authRouter;
