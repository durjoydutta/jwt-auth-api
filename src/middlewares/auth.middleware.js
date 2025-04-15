import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.config.js";

const authMiddleWare = (req, res, next) => {
  try {
    const token =
      req.headers["authorization"]?.split(" ")[1] ||
      req.cookies?.jwt ||
      req.query.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized or Invalid Access Token" });
    }
    const decodedToken = jwt.verify(token, JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized or Invalid Token" });
    }
    req.body = req.body || {};
    req.body.userId = decodedToken._id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.message || "Unauthorized or Invalid Access Token" });
  }
};

export default authMiddleWare;
