import { SENDER_EMAIL } from "../config/env.config.js";
import transporter from "../config/mailer.config.js";

//helper function to sendVerificationEmail
// this function is used in auth.controller.js
// to send verification email to the user
const sendVerificationEmailHelper = async (user) => {
  const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.verifyOTP = verifyOTP;
  user.verifyOTPExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  const mailOptions = {
    from: SENDER_EMAIL,
    to: user.email,
    subject: "Please verify your email address",
    text: `Hi ${user.username}, Your verification code is: ${verifyOTP}`,
    html: `<p>Hi ${user.username}, Your verification code is: <strong>${verifyOTP}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
export default sendVerificationEmailHelper;
