const mongoose = require("mongoose");
const logger = require("./logger");

const connect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  mongoose.connection.on("connected", () =>
    logger.info(`MongoDB connected → ${mongoose.connection.host}`)
  );
  mongoose.connection.on("error", (err) =>
    logger.error(`MongoDB connection error: ${err.message}`)
  );
  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected")
  );

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

const disconnect = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected (graceful shutdown)");
};

module.exports = { connect, disconnect };