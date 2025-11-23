const express = require("express");
const app = express();
const connectDB = require("./config/db");
require("dotenv").config();
require("colors");
const morgan = require("morgan");

connectDB();
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("SportLife ishlayabdi");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server ${PORT} da ishga tushdi`);
});
