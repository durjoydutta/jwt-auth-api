import { SENDER_EMAIL } from "../config/env.config.js";
import transporter from "../config/mailer.config.js";

//helper function to sendVerificationMail
// this function is used in auth.controller.js
// to send verification email to the user
const sendVerificationMailHelper = async (user) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to: user.email,
    subject: "Please verify your email address",
    text: `Hi ${user.username}, Your verification code is: ${user.verifyOTP}`,
    html: `<p>Hi ${user.username}, Your verification code is: <strong>${user.verifyOTP}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
export default sendVerificationMailHelper;
