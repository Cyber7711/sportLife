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

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://texnikum.uz"
        : "http://localhost:4000",
    credentials: true,
  })
);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(hpp());

const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
const filtered = routeFiles.filter(
  (f) => f.endsWith("Routes.js") && f !== "authRoutes"
);

console.log("Loaded route file:", filtered);

for (const file of filtered) {
  const routeName = file.replace("Routes.js", "");
  const route = require(path.join(routesPath, file));
  app.use(`/${routeName}`, route);
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Juda kop surovlar yuborildi. Keyinroq qayta urinib kuring ",
});

app.use("/api", limiter);
app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.status(200).json({ sucess: true, message: "SportLife ishlayabdi" });
});

app.use("/api/v1/auth", authRoutes);

app.all(" ", (req, res, next) => {
  next(new AppError(`Bu URL topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server ${PORT} da ishga tushdi`);
});
