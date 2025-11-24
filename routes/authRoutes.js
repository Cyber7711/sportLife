const express = require("express");
const authController = require("../controller/authController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Admin rolengiz tasdiqlandi" });
});

module.exports = router;
