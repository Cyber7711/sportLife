const express = require("express");
const authController = require("../controller/authController");
const { protect, restrictTo } = require("../middleware/protect");
const { registerLimiter, loginLimiter } = require("../utils/rateLimiter");

const router = express.Router();

router.post("/register", registerLimiter(), authController.register);
router.post("/login", loginLimiter(), authController.login);
router.post("/refresh-token", authController.refreshToken);

router.get("/me", protect, authController.getMe);

module.exports = router;
