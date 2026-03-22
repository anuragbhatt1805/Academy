import logger from "../utils/logger.util.js";
import { v4 as uuid } from "uuid";

export const requestLogger = (serviceName) => {
  return (req, res, next) => {
    const start = Date.now();

    const requestId = req.headers["x-request-id"] || uuid();
    req.requestId = requestId;

    res.on("finish", () => {
      logger.info("API Request", {
        requestId,
        service: serviceName,
        method: req.method,
        api: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        responseSummary: res.locals.responseSummary || null,
      });
    });

    next();
  };
};
