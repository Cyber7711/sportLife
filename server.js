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
const globalErrorHandler = require("./middleware/globalErrorHandler.js.js");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes.js");
const {
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require("./utils/rateLimiter.js");

connectDB();

app.set("trust proxy", 1);

const globalSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: () => 1000,
  skipFailedRequests: true,
});

app.use(globalSpeedLimiter);

const allowedOrigins = [
  "https://sportlife.uz",
  "https://www.sportlife.uz",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
}

app.use(hpp()); // Parameter pollution oldini olish

// Morgan – faqat devda
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ================================
// 6) Auth Routes + Individual Rate Limiters (eng muhimi!)
// ================================
// Har bir endpoint uchun alohida limiter – bu eng to‘g‘ri usul
app.use("/auth/register", registerLimiter(), authRoutes);
app.use("/auth/login", loginLimiter(), authRoutes);
app.use("/auth/forgot-password", resetPasswordLimiter(), authRoutes);
app.use("/auth/reset-password", resetPasswordLimiter(), authRoutes);

// Qolgan auth routelarni limitsiz qoldiramiz (masalan verify-email, me, logout)
// Agar kerak bo‘lsa – ularga ham qo‘shish mumkin

// ================================
// 7) Dynamic API Routes (authdan tashqari)
// ================================
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath)
  .filter((file) => {
    return (
      file.endsWith("Routes.js") &&
      !file.startsWith("auth") &&
      file !== "index.js"
    );
  })
  .forEach((file) => {
    const routeName = file
      .replace("Routes.js", "")
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase();
    const routePath = `/api/v1/${routeName}`;
    const route = require(path.join(routesPath, file));

    // Masalan: coachRoutes.js → /api/v1/coach
    // sportRoutes.js → /api/v1/sport
    app.use(routePath, route);
    console.log(`Route yuklandi: ${routePath}`);
  });

// ================================
// 8) Health Check & Root
// ================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SportLife API ishlayapti!",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 – barcha routelardan keyin!
app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`.red, 404));
});

// ================================
// 9) Global Error Handler
// ================================
app.use(globalErrorHandler);

// ================================
// 10) Serverni ishga tushirish (graceful)
// ================================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`.green.bold);
  console.log(`Mu hit: http://localhost:${PORT}`.cyan);
});

// Graceful shutdown (PM2, Docker, Render uchun muhim!)
process.on("SIGTERM", () => {
  console.log("SIGTERM qabul qilindi. Server o‘chirilmoqda...");
  server.close(() => {
    console.log("Server to‘xtadi.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT (Ctrl+C). Server o‘chirilmoqda...");
  server.close(() => {
    process.exit(0);
  });
});
