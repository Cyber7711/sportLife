const express = require("express");
const app = express();
const connectDB = require("./config/db");
require("dotenv").config();
require("colors");
const morgan = require("morgan");
const globalErrorHandler = require("./middleware/globalErrorHandler.js");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes.js");
const cookies = require("cookies");

connectDB();
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("SportLife ishlayabdi");
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
