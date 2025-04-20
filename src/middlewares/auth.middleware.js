import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../config/env.config.js";
import User from "../models/user.model.js";

const authMiddleWare = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token =
      req.headers["authorization"]?.split(" ")[1] || req.cookies?.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized or missing access token" });
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized or Invalid Token" });
    }

    req.userId = decodedToken._id;
    req.user = req.user || (await User.findById(req.userId));
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has been deleted
    if (req.user.isDeleted) {
      return res.status(403).json({ message: "User account has been deleted" });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication",
      error: err.message,
    });
  }
};

export default authMiddleWare;
