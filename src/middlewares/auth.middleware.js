import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.config.js";
import User from "../models/user.model.js";

const authMiddleWare = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"]?.split(" ")[1] || req.cookies?.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized or Invalid Access Token" });
    }
    const decodedToken = jwt.verify(token, JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized or Invalid Token" });
    }
    const user = await User.findOne({ _id: decodedToken._id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.body = req.body || {};
    req.body.userId = decodedToken._id;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication",
      error: err.message,
    });
  }
};

export default authMiddleWare;
