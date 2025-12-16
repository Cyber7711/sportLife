const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/protect");
const SportsmanController = require("../controller/sportsmanController");

router
  .route("/")
  .get(protect, SportsmanController.getAll)
  .post(protect, SportsmanController.create);

router
  .route("/:id")
  .get(protect, SportsmanController.getById)
  .patch(protect, restrictTo("admin", "coach"), SportsmanController.update)
  .delete(protect, restrictTo("admin", "coach"), SportsmanController.deleted);

module.exports = router;
