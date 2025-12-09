const express = require("express");
const authController = require("../controller/authController");
const { protect, restrictTo } = require("../middleware/protect");
const {
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require("../utils/rateLimiter");

const router = express.Router();

router.post("/", registerLimiter(), authController.register);
router.post("/", loginLimiter(), authController.login);
router.post("/", authController.refreshToken);

router.get("/", protect, authController.getMe);

router.get("/", protect, restrictTo("admin"), (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Admin rolengiz tasdiqlandi" });
});

module.exports = router;
