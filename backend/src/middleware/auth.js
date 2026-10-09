const jwt = require("jsonwebtoken");
const { jwtSecret, isProd } = require("../config/env");
const ApiError = require("../utils/ApiError");

const COOKIE_NAME = "token";
const MAX_AGE = 1000 * 60 * 60 * 24 * 7;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  maxAge: MAX_AGE,
  path: "/",
};

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ sub: String(userId) }, jwtSecret, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, cookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
};

const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, "Authentication required.");
  try {
    req.userId = jwt.verify(token, jwtSecret).sub;
  } catch {
    clearAuthCookie(res);
    throw new ApiError(401, "Session expired. Please log in again.");
  }
  next();
};

module.exports = { requireAuth, setAuthCookie, clearAuthCookie };
