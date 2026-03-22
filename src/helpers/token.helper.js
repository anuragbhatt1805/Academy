import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../constant.js";

/**
 * Generates an Access Token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generates a Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Validates an Access Token
 */
export const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Validates a Refresh Token
 */
export const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
