const coachController = require("../controller/coachController");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

router.post("/", protect, coachController.createCoach);
router.get("/", protect, (req, res, next) => {
  coachController.getAllCoaches(req, res, next);
});
router.get("/:id", protect, coachController.getCoachById);
router.put("/:id", protect, coachController.updateCoach);
router.delete("/:id", protect, coachController.deleteCoach);

module.exports = router;
