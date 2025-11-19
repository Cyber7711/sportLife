const express = require("express");
const app = express();
const connectDB = require("./config/db");
require("dotenv").config();
require("colors");

connectDB();
app.use(express.json({ limit: "10kb" }));

app.get((req, res) => {
  res.sent("SportLife ishlayabdi");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server ${PORT} da ishga tushdi`);
});
