const jwt = require("jsonwebtoken");
const User = require("./user.model");
const { createError } = require("./errorHandler");
const logger = require("./logger");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw createError("Email already registered", 409);

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    logger.info(`New user registered: ${user.email}`);
    res.status(201).json({
      status: "success",
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError("Email and password are required", 400);

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      throw createError("Invalid email or password", 401);

    const token = signToken(user._id);
    logger.info(`User logged in: ${user.email}`);
    res.json({
      status: "success",
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };