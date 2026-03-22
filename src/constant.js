import dotenv from "dotenv";
const envObject = {};

dotenv.config({
  quiet: true,
  processEnv: envObject,
});

// Server
export const APP_NAME = envObject.APP_NAME || "Academy";
export const PORT = envObject.PORT || 3000;
export const NODE_ENV = envObject.NODE_ENV || "production";

// MongoDB
export const MONGO_URI = envObject.MONGO_URI;
export const DB_NAME = APP_NAME.toLowerCase();

// CORS_ORIGINs
const envOrigins = process.env.CORS ? process.env.CORS.split(",") : [];
export const CORS_ORIGIN =
  process.env.NODE_ENV !== "production"
    ? [...envOrigins, "http://localhost:5173"]
    : envOrigins;
