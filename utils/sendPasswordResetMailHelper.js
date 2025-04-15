import { SENDER_EMAIL } from "../config/env.config.js";
import transporter from "../config/mailer.config.js";

//helper function to sendPasswordResetMail
// this function is used in auth.controller.js
// to send password reset email to the user
const sendPasswordResetMailHelper = async (user) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to: user.email,
    subject: "Password Reset Request",
    text: `Hi ${user.username}, Your password reset code is: ${user.resetOTP}`,
    html: `<p>Hi ${user.username}, Your password reset code is: <strong>${user.resetOTP}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
export default sendPasswordResetMailHelper;
