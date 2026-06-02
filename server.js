require("dotenv").config();

const app = require("./app");
const { connect, disconnect } = require("./db");
const logger = require("./logger");

const PORT = process.env.PORT || 3000;
let server;

const start = async () => {
  await connect();

  server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}  [${process.env.NODE_ENV || "development"}]`);
  });
};

const shutdown = async (signal) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server?.close(async () => {
    await disconnect();
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  shutdown("unhandledRejection");
});

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});