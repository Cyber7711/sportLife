const express = require("express");
const router = express.Router();
const sportsmanController = require("../controller/sportsmanController");
const { protect, restrictTo } = require("../middleware//protect"); // Yo'lni tekshir

// Hamma sportchilarni ko'rish (Login qilganlar uchun)
router.get("/", protect, sportsmanController.getAll);

// Yangi sportchi qo'shish (Faqat murabbiy yoki ota-ona uchun)
router.post(
  "/",
  protect,
  restrictTo("coach", "parent", "admin"),
  sportsmanController.create
);

// Bitta sportchini ko'rish, yangilash va o'chirish
router
  .route("/:id")
  .get(protect, sportsmanController.getById)
  .patch(protect, restrictTo("coach", "admin"), sportsmanController.update)
  .delete(protect, restrictTo("admin"), sportsmanController.deleted);

module.exports = router;
