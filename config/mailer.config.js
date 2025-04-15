import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "./env.config.js";

let mailConfig = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(mailConfig);

transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying SMTP transporter:", error);
  } else {
    console.log("SMTP SERVER is ready to send emails.");
  }
});

export default transporter;
