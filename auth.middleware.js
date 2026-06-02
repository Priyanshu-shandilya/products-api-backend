const jwt = require("jsonwebtoken");
const User = require("./user.model");
const { createError } = require("./errorHandler");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw createError("You are not logged in", 401);

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw createError("User no longer exists", 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") return next(createError("Invalid token", 401));
    if (err.name === "TokenExpiredError") return next(createError("Token expired, please login again", 401));
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(createError("You do not have permission", 403));
  next();
};

module.exports = { protect, restrictTo };