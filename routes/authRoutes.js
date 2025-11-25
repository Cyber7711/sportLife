const express = require("express");
const authController = require("../controller/authController");
const { protect, restrictTo } = require("../middleware/protect");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

router.get("/me", protect, authController.getMe);

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Admin rolengiz tasdiqlandi" });
});

module.exports = router;
