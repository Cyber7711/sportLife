const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");
const { RedisStore } = require("rate-limit-redis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

function createIPLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `user_${req.user.id}`;
      }
      return `ip_${req.ip}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message,
  });
}

function registerLimiter() {
  return createIPLimiter({
    max: 3,
    windowMs: 60 * 60 * 1000,
    message: {
      error: "Ko'p urunishlar. 1 soatdan keyin qayta urinib ko‘ring.",
    },
  });
}

function loginLimiter() {
  return createIPLimiter({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: {
      error: "Ko'p urunishlar. 15 daqiqadan keyin qayta urinib ko‘ring.",
    },
  });
}

function resetLimiter(params) {
  return createIPLimiter({
    max: 5,
    windowMs: 30 * 60 * 1000,
    message: {
      error: "Ko'p urunishlar. 30 daqiqadan keyin qayta urinib ko‘ring.",
    },
  });
}

const authLimiter = { registerLimiter, loginLimiter, resetLimiter };

module.exports = { redisClient, createIPLimiter, authLimiter };
