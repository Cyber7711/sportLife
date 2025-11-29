const rateLimit = require("express-rate-limit");
const redisStore = require("rate-limit-redis");
const redis = require("ioredis");

const redisClient = new redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

function createLimiter({ windowsMs, max, message }) {
  return rateLimit({
    windowsMs,
    max,
    store: new redisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message,
  });
}

module.exports = { redisClient, createLimiter };
