import { User } from "../models/user.model.js";
import { userService } from "../services/user.service.js";
import logger from "../utils/logger.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} from "../helpers/token.helper.js";
import { NODE_ENV } from "../constant.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      const options = {
        httpOnly: true,
        secure: NODE_ENV === "production",
      };

      res
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    logger.error("Login Error", { error: error.message });
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  const { refresh_token } = req.cookies;
  if (refresh_token) {
    const user = await User.findOne({ refreshToken: refresh_token });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  const options = {
    httpOnly: true,
    secure: NODE_ENV === "production",
  };

  res
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json({
      message: "Logged out successfully.",
    });
};

export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refresh_token;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = validateRefreshToken(incomingRefreshToken);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({ message: "Refresh token is expired or used" });
    }

    const options = {
      httpOnly: true,
      secure: NODE_ENV === "production",
    };

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("access_token", newAccessToken, options)
      .cookie("refresh_token", newRefreshToken, options)
      .json({ message: "Access token refreshed successfully" });

  } catch (error) {
    logger.error("Refresh Token Error", { error: error.message });
    res.status(500).json({ message: "Server error during token refresh" });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const { search, role, sortBy, order } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role === "admin" || role === "user") {
      query.role = role;
    }

    const sortOptions = {};
    if (sortBy === "updatedAt") {
      sortOptions.updatedAt = order === "asc" ? 1 : -1; // Default to newest first
    } else if (sortBy === "createdAt") {
      sortOptions.createdAt = order === "asc" ? 1 : -1; // Default to newest first
    } else {
      sortOptions.name = order === "desc" ? -1 : 1; // Default to A-Z
    }

    const users = await userService.getAllUsers(query, sortOptions);
    res.json(users);
  } catch (error) {
    logger.error("Get All Profiles Error", { error: error.message });
    res.status(500).json({ message: "Server error fetching profiles" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userService.findUserById(req.params.id);
    // Explicitly excluding sensitive details happens automatically in toJSON,
    // but we still ensure we never access them directly in responses.
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching user" });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Generate a temporary password since they are being invited
    const tempPassword = Math.random().toString(36).slice(-8);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userService.createUser({
      name,
      email,
      password: tempPassword,
      role: role || "user",
      resetPasswordOnLogin: true,
    });

    if (user) {
      res.status(201).json({
        message: "User invited successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: tempPassword,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    logger.error("Invite Error", { error: error.message });
    res.status(500).json({ message: "Server error inviting user" });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    await userService.updatePassword(req.user._id, password, false);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Self Password Update Error", { error: error.message });
    res.status(500).json({ message: "Server error updating password" });
  }
};

export const updateOtherPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const updatedUser = await userService.updatePassword(id, password, true);
    res.json({
      message: "Password updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logger.error("Admin Password Update Error", { error: error.message });
    res.status(500).json({ message: "Server error updating password" });
  }
};
