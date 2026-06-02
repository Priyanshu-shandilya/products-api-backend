/**
 * Minimal structured logger.
 * Wraps console with ISO timestamps and log levels.
 * Swap out for Winston/Pino in production.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const ENV_LEVEL = process.env.LOG_LEVEL || "debug";
const currentLevel = LEVELS[ENV_LEVEL] ?? LEVELS.debug;

const fmt = (level, msg, meta) => {
  const base = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
  error: (msg, meta) =>
    LEVELS.error <= currentLevel && console.error(fmt("error", msg, meta)),
  warn: (msg, meta) =>
    LEVELS.warn <= currentLevel && console.warn(fmt("warn", msg, meta)),
  info: (msg, meta) =>
    LEVELS.info <= currentLevel && console.info(fmt("info", msg, meta)),
  debug: (msg, meta) =>
    LEVELS.debug <= currentLevel && console.debug(fmt("debug", msg, meta)),
};

module.exports = logger;
