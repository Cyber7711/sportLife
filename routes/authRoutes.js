const express = require("express");
const authController = require("../controller/authController");
const { protect, restrictTo } = require("../middleware/protect");
const {
  registerLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require("../utils/rateLimiter");

const router = express.Router();

router.post("/register", registerLimiter(), authController.register);
router.post("/login", loginLimiter(), authController.login);
router.post("/refresh-token", authController.refreshToken);

router.get("/me", protect, authController.getMe);

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Admin rolengiz tasdiqlandi" });
});

module.exports = router;
