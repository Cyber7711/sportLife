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
const { redisClient, createLimiter } = require("./config/rateLimiter.js");

connectDB();

const speedLimiter = slowDown({
  windowsMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: 500,
});

const allowedOrigins = ["http://sportlife.uz", "http://localhost:4000"];

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(hpp());
app.use(speedLimiter);

const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
const filtered = routeFiles.filter(
  (f) => /^[a-zA-Z]+Routes\.js$/.test(f) && f !== "authRoutes.js"
);

if (process.env.NODE_ENV === "development") {
  console.log("Loaded route file:", filtered);
}

for (const file of filtered) {
  const routeName = file.replace("Routes.js", "");
  const route = require(path.join(routesPath, file));
  app.use(`/api/v1/${routeName}`, route);
}

app.use(
  "/auth",
  speedLimiter,
  createLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: "Kop urunishlar. 15 daqiqadan keyin qayta urunib kuring",
    },
  }),
  authRoutes
);

app.get("/", (req, res) => {
  res.send("SportLife ishlayabdi");
});

app.use((req, res, next) => {
  next(new AppError(`Bu URL topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server ${PORT} da ishga tushdi`);
});
