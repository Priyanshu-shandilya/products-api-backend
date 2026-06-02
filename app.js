const express = require("express");
const morgan = require("morgan");
const productRoutes = require("./product.routes");
const authRoutes = require("./auth.routes");
const { errorHandler } = require("./errorHandler");

const app = express();

app.use(morgan(process.env.LOG_FORMAT || "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);

app.use((_req, res) =>
  res.status(404).json({ status: "fail", message: "Route not found" })
);

app.use(errorHandler);

module.exports = app;