const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const { setAuthCookie, clearAuthCookie } = require("../middleware/auth");

const credentials = (body) => {
  const { username, password } = body ?? {};
  // typeof checks stop operator objects like { "$ne": "" } from reaching the query.
  if (typeof username !== "string" || typeof password !== "string") {
    throw new ApiError(400, "Username and password are required.");
  }
  return { username: username.trim(), password };
};

const signup = async (req, res) => {
  const { username, password } = credentials(req.body);
  if (username.length < 3) throw new ApiError(400, "Username must be at least 3 characters.");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
  if (await User.exists({ username })) throw new ApiError(409, "Username unavailable.");

  const user = await User.create({ username, password });
  setAuthCookie(res, user._id);
  res.status(201).json({ user });
};

const login = async (req, res) => {
  const { username, password } = credentials(req.body);
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Login failed, try again.");
  }
  setAuthCookie(res, user._id);
  res.json({ user });
};

const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
};

const me = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    clearAuthCookie(res);
    throw new ApiError(401, "Authentication required.");
  }
  res.json({ user });
};

module.exports = { signup, login, logout, me };
