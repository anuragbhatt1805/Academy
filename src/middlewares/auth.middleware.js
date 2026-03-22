import { User } from "../models/user.model.js";
import logger from "../utils/logger.util.js";
import { validateAccessToken } from "../helpers/token.helper.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    try {
      const decoded = validateAccessToken(token);

      if (!decoded) {
        logger.warn("Token validation failed");
        return res.status(401).json({ message: "Not authorized, token failed" });
      }

      req.user = await User.findById(decoded.id).select(
        "-password -resetPasswordOnLogin -refreshToken",
      );

      if (!req.user) {
        logger.warn("Token valid but user not found", { userId: decoded.id });
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      logger.error("Error internally in auth middleware", { error: error.message });
      return res.status(500).json({ message: "Server error in auth middleware" });
    }
  } else {
    logger.warn("Not authorized, no token provided in cookies");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    logger.warn("Not authorized as an admin", { userId: req.user?._id });
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
