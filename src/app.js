import express from "express";
import cors from "cors";

import { CORS_ORIGIN } from "./constant.js";
import logger from "./utils/logger.util.js";
import { cookieParser } from "./middlewares/cookie.middleware.js";
import userRouter from "./routes/user.route.js";

// Initialize express app
const app = express();
app.disable("x-powered-by");

// Pre-routes middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser);

// Routes
app.use("/api/users", userRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

// Error Handling
app.use((err, req, res, next) => {
  logger.error("Unhandled Error", {
    requestId: req.requestId,
    service: "global",
    api: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
