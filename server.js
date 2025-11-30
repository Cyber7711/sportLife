const express = require("express");
const app = express();
const connectDB = require("./config/db");
require("dotenv").config();
require("colors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const slowDown = require("express-slow-down");
const globalErrorHandler = require("./middleware/globalErrorHandler.js");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes.js");
const { createIPLimiter } = require("./config/rateLimiter.js");

// ================================
// 1) DB ulash
// ================================
connectDB();

// ================================
// 2) Trust Proxy (RATE-LIMIT uchun muhim)
// ================================
app.set("trust proxy", 1);

// ================================
// 3) Speed Limiter (Global API slowdown)
// ================================
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 200,
  delayMs: () => 1500, // ux-friendly bo'lishi uchun pasaytirildi
});

// ================================
// 4) CORS
// ================================
const allowedOrigins = ["http://sportlife.uz", "http://localhost:4000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false); // 403 o‘rniga
    },
    credentials: true,
  })
);

// ================================
// 5) Middleware
// ================================
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(hpp());
app.use(speedLimiter);

// ================================
// 6) Dynamic routes
// ================================
const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
const filtered = routeFiles.filter(
  (f) => /^[a-zA-Z]+Routes\.js$/.test(f) && f !== "authRoutes.js"
);

for (const file of filtered) {
  const routeName = file.replace("Routes.js", "");
  const route = require(path.join(routesPath, file));
  app.use(`/api/v1/${routeName}`, route);
}

// ================================
// 7) AUTH LIMITER (faqat auth uchun, 15min / 10 attempts)
// ================================
app.use(
  "/auth",
  createIPLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: "Ko'p urunishlar. 15 daqiqadan keyin qayta urinib ko‘ring.",
    },
  }),
  authRoutes
);

// ================================
// 8) Root & Error Handler
// ================================
app.get("/", (req, res) => {
  res.send("SportLife ishlayapti");
});

app.use((req, res, next) => {
  next(new AppError(`Bu URL topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

// ================================
// 9) Server ishga tushish
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} da ishga tushdi`);
});
