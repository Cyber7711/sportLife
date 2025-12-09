// server.js — FINAL & PERFECT VERSION (2025 standartlarida)
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const slowDown = require("express-slow-down");
require("dotenv").config();
require("colors");

const connectDB = require("./config/db");
const globalErrorHandler = require("./middleware/globalErrorHandler.js"); // TO‘G‘RILANDI!
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes");
const {
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require("./utils/rateLimiter");

// ================================
// 1) DB ulanish
// ================================
connectDB();

// ================================
// 2) Global Middlewares
// ================================
app.set("trust proxy", 1);

// Global rate limiting (spam hujumlardan himoya)
const globalSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  delayAfter: 100, // 100 ta so‘rovdan keyin
  delayMs: () => 1000, // har so‘rovga +1 sekund
  skipFailedRequests: true,
});
app.use(globalSpeedLimiter);

// ================================
// 3) CORS — faqat ishonchli domenlar
// ================================
const allowedOrigins = [
  "https://sportlife.uz",
  "https://www.sportlife.uz",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // yoki new Error("CORS rad etildi")
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ================================
// 4) Security & Body Parsing
// ================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: process.env.NODE_ENV !== "production",
  })
);

app.use(hpp()); // Parameter pollution himoyasi

// Morgan — faqat devda
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ================================
// 5) Auth Routes + Rate Limiting
// ================================
app.use("/auth/register", registerLimiter(), authRoutes);
app.use("/auth/login", loginLimiter(), authRoutes);
app.use("/auth/forgot-password", resetPasswordLimiter(), authRoutes);
app.use("/auth/reset-password", resetPasswordLimiter(), authRoutes);
app.use("/auth", authRoutes); // qolganlari (me, logout, change-password)

// ================================
// 6) Dynamic API Routes
// ================================
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath)
  .filter(
    (file) =>
      file.endsWith("Routes.js") &&
      !file.startsWith("auth") &&
      file !== "index.js"
  )
  .forEach((file) => {
    const routeName = file
      .replace("Routes.js", "")
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase();

    const routePath = `/api/v1/${routeName}`;
    const route = require(path.join(routesPath, file));

    app.use(routePath, route);
    console.log(`Route yuklandi: ${routePath}`.green);
  });

// ================================
// 7) Health Check
// ================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SportLife API ishlayapti!",
    uptime: `${Math.floor(process.uptime())} sekund`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ================================
// 8) 404 Handler
// ================================
app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`, 404));
});

// ================================
// 9) Global Error Handler (oxirgi bo‘lishi shart!)
// ================================
app.use(globalErrorHandler);

// ================================
// 10) Server Start
// ================================
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`.green.bold);
  console.log(`Mu hit: http://localhost:${PORT}`.cyan);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} qabul qilindi. Server o‘chirilmoqda...`.yellow);
  server.close(() => {
    console.log("Server toza yopildi.".green);
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
