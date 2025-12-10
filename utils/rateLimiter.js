const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");

let redisClient;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 10) {
        console.warn(
          "Redis rate-limiter uchun ulanmadi, IP-based fallback ishlaydi"
        );
        return null; // retry to'xtasin
      }
      return Math.min(times * 500, 2000);
    },
    maxRetriesPerRequest: null, // rate-limit-redis uchun muhim!
    enableOfflineQueue: false, // offline holatda queue to‘planmasin
  });

  redisClient.on("error", (err) => {
    console.warn("Rate limiter Redis xatosi:", err.message);
    // Bu yerda ilova o‘chmaydi!
  });

  redisClient.on("connect", () => {
    console.log("Rate limiter Redisga muvaffaqiyatli ulandi");
  });
} catch (err) {
  console.warn("Redis yaratishda xato:", err.message);
  redisClient = null;
}

// Umumiy limiter yaratuvchi funksiya
function createLimiter({ windowMs, max, message, keyPrefix = "rl" }) {
  const baseConfig = {
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
    skip: (req) => {
      // Agar Redis ishlamasa – limiting o‘chsin (yoki memory store ishlatish mumkin)
      return !redisClient?.status || redisClient.status !== "ready";
    },
  };

  // Agar Redis ishlayotgan bo‘lsa – RedisStore, aks holda memory fallback
  if (redisClient && redisClient.status === "ready") {
    return rateLimit({
      ...baseConfig,
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: `${keyPrefix}:`,
      }),
      keyGenerator: (req) => {
        if (req.user?.id) return `user:${req.user.id}`;
        return `ip:${req.ip || req.socket.remoteAddress}`;
      },
    });
  }

  // Redis ishlamasa – oddiy memory store (ilovada crash bo‘lmaydi)
  console.warn(`Redis ulanmadi → ${keyPrefix} limiter memory store ga o‘tdi`);
  return rateLimit({
    ...baseConfig,
    keyGenerator: (req) => {
      return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
  });
}
// https://www.instagram.com/reel/DPRaFqQjX6X/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DO0HS-nDxQl/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DLycYkbo4wo/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DN1KD2I0E5A/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==

// Tayyor limiterlar
const registerLimiter = () =>
  createLimiter({
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 soat
    message:
      "Ko‘p ro‘yxatdan o‘tish urinishlari. 1 soatdan keyin qayta urinib ko‘ring.",
    keyPrefix: "register",
  });

const loginLimiter = () =>
  createLimiter({
    max: 10,
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    message:
      "Ko‘p kirish urinishlari. 15 daqiqadan keyin qayta urinib ko‘ring.",
    keyPrefix: "login",
  });

const resetPasswordLimiter = () =>
  createLimiter({
    max: 5,
    windowMs: 30 * 60 * 1000, // 30 daqiqa
    message:
      "Parolni tiklash uchun ko‘p urinishlar. 30 daqiqadan keyin qayta urinib ko‘ring.",
    keyPrefix: "reset",
  });

module.exports = {
  redisClient,
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
};
