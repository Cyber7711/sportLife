const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const slowDown = require("express-slow-down");
const User = require("./model/user");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("colors");

const connectDB = require("./config/db");
const globalErrorHandler = require("./middleware/globalErrorHandler.js");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes");
const {
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require("./utils/rateLimiter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: process.env.NODE_ENV !== "production",
  })
);

app.use(hpp());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/auth", authRoutes);

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

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SportLife API ishlayapti!",
    uptime: `${Math.floor(process.uptime())} sekund`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, async () => {
  console.log(`Server ${PORT}-portda ishga tushdi`.green.bold);
  console.log(`Mu hit: http://localhost:${PORT}`.cyan);
});

const shutdown = (signal) => {
  console.log(`${signal} qabul qilindi. Server o‘chirilmoqda...`.yellow);
  server.close(() => {
    console.log("Server toza yopildi.".green);
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
