import express from "express";
import {
  login,
  logout,
  getProfile,
  getUserProfile,
  inviteUser,
  updateOtherPassword,
  getAllProfiles,
  updateMyPassword,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { requestLogger } from "../middlewares/logger.middleware.js";

const router = express.Router();

router.use(requestLogger("UserService"));

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/password", protect, updateMyPassword); // update own password
router.get("/", protect, getAllProfiles); // list all on basis of query type
router.get("/:id", protect, getUserProfile); // view others profile

// Admin routes
router.post("/invite", protect, admin, inviteUser);
router.put("/:id/password", protect, admin, updateOtherPassword);

export default router;
