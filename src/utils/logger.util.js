import winston from "winston";
import { APP_NAME, NODE_ENV } from "../constant";

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  defaultMeta: {
    app: APP_NAME,
    env: NODE_ENV,
  },

  transports: [new winston.transports.Console()],
});

export default logger;
