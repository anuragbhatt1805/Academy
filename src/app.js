import express from "express";
import cors from "cors";

import { CORS_ORIGIN } from "./constant.js";
import logger from "./utils/logger.util.js";

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
