const CoachService = require("../service/coachService");
const catchAsync = require("../middleware/asyncWrapper");
const sendResponse = require("../middleware/sendResponse");

const createCoach = catchAsync(async (req, res) => {
  const result = await CoachService.createCoach(req.body);
  sendResponse(res, {
    status: 201,
    message: "Murabbiy muvaffaqiyatli yaratildi",
    data: result,
  });
});

const getAllCoaches = catchAsync(async (req, res) => {
  const result = await CoachService.getAllCoaches(req.query);

  sendResponse(res, {
    status: 200,
    message: result?.data?.length
      ? "Murabbiylar muvaffqiyatli topildi"
      : "Hozircha murabbiylar yuq",
    data: result,
  });
});

const getCoachById = catchAsync(async (req, res) => {
  const result = await CoachService.getCoachById(req.params.id);
  sendResponse(res, {
    status: 200,
    message: "Murabbiy muvaffaqiyatli olindi",
    data: result,
  });
});

const updateCoach = catchAsync(async (req, res) => {
  const result = await CoachService.updateCoach(req.params.id, req.body);
  sendResponse(res, {
    status: 200,
    message: "Murabbiy muvaffaqiyatli yangilandi",
    data: result,
  });
});

const deleteCoach = catchAsync(async (req, res) => {
  await CoachService.deleteCoach(req.params.id);

  res.status(204).set("X-Message", "Murabbiy muvaffaqiyatli uchirildi").end();
});

const coachController = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = coachController;
