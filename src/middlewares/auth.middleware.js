import { User } from "../models/user.model.js";
import logger from "../utils/logger.util.js";
import { validateAccessToken } from "../helpers/token.helper.js";
import { salesforceService } from "../services/salesforce.service.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    try {
      const decoded = validateAccessToken(token);

      if (!decoded) {
        logger.warn("Token validation failed");
        return res
          .status(401)
          .json({ message: "Not authorized, token failed" });
      }

      req.user = await User.findById(decoded.id)
        .select("-password -refreshToken")
        .lean();

      if (!req.user) {
        logger.warn("Token valid but user not found", { userId: decoded.id });
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // Block access to everything except own password update if reset is required
        const isPasswordUpdateRoute =
          req.originalUrl.split("?")[0] === "/api/users/password" &&
          req.method === "PUT";

      if (req.user.resetPasswordOnLogin && !isPasswordUpdateRoute) {
          logger.warn(
            "User attempted action without resetting mandatory password",
            { userId: req.user._id },
          );
          return res
            .status(403)
            .json({ message: "Please reset your password to continue" });
      }

      const { resetPasswordOnLogin, ...safeUser } = req.user;
      req.user = safeUser;

      next();
    } catch (error) {
      logger.error("Error internally in auth middleware", {
        error: error.message,
      });
      return res.status(500).json({ message: "Server error in auth middleware" });
    }
  } else {
    logger.warn("Not authorized, no internal local token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const salesforceProtect = async (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const sfProfile = await salesforceService.getSalesforceProfile(token);

      if (!sfProfile) {
        logger.warn("Token validation failed for Salesforce proxy");
        return res.status(401).json({ message: "Not authorized with Salesforce, token failed" });
      }

      req.user = {
        _id: sfProfile.user_id || sfProfile.sub,
        name: sfProfile.name,
        email: sfProfile.email,
        profilePhoto: sfProfile.picture,
        role: "user",
        isSalesforce: true
      };

      next();
    } catch (error) {
      logger.error("Error internally in Salesforce auth middleware", {
        error: error.message,
      });
      return res.status(500).json({ message: "Server error in salesforce auth middleware" });
    }
  } else {
    logger.warn("Not authorized, no Salesforce token provided in cookies or headers");
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
