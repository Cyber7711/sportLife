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
const rateLimit = require("express-rate-limit");
const globalErrorHandler = require("./middleware/globalErrorHandler.js");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes.js");
const cookies = require("cookies");

connectDB();
app.use(rateLimit);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Juda kop surovlar yuborildi. Keyinroq qayta urinib kuring ",
});

app.use("/api", limiter);
app.set("trust proxy", 1);

const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: "Kop urunishlar. 15 daqiqadan keyin qayta urunib kuring",
});

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://sportlife.uz"
        : "http://localhost:4000",
    credentials: true,
  })
);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(hpp());

const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
const filtered = routeFiles.filter(
  (f) => f.endsWith("Routes.js") && f !== "authRoutes.js"
);

if (process.env.NODE_ENV === "development") {
  console.log("Loaded route file:", filtered);
}

for (const file of filtered) {
  const routeName = file.replace("Routes.js", "");
  const route = require(path.join(routesPath, file));
  app.use(`/api/v1/${routeName}`, route);
}

app.use("/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.send("SportLife ishlayabdi");
});

app.use((err, req, res, next) => {
  console.error("Xatolik:".red, err.stack);
  res.status(500).json({ message: err.message });
});

app.use((req, res, next) => {
  next(new AppError(`Bu URL topilmadi: ${req.originalUrl}`.red, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server ${PORT} da ishga tushdi`);
});
