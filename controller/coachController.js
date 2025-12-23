const CoachService = require("../service/coachService");
const catchAsync = require("../middleware/asyncWrapper");
const sendResponse = require("../middleware/sendResponse");

const createCoach = catchAsync(async (req, res) => {
  console.log("1. Foydalanuvchi roli:", req.user.role);

  //userId ni ikkinchi argument sifatida uzatish shart!
  const result = await CoachService.create(req.body, req.user._id);

  sendResponse(res, {
    status: 201,
    message: "Murabbiy muvaffaqiyatli yaratildi",
    data: result,
  });
});

const getAllCoaches = catchAsync(async (req, res) => {
  const result = await CoachService.getAll(req.query);

  sendResponse(res, {
    status: 200,
    message: result?.data?.length
      ? "Murabbiylar muvaffqiyatli topildi"
      : "Hozircha murabbiylar yuq",
    data: result,
  });
});

const getCoachById = catchAsync(async (req, res) => {
  const result = await CoachService.getById(req.params.id);
  sendResponse(res, {
    status: 200,
    message: "Murabbiy muvaffaqiyatli olindi",
    data: result,
  });
});

const updateCoach = catchAsync(async (req, res) => {
  // Service-ga id, body va user ob'ektini uzatamiz
  const result = await CoachService.update(req.params.id, req.body, req.user);
  sendResponse(res, {
    status: 200,
    message: "Murabbiy muvaffaqiyatli yangilandi",
    data: result,
  });
});

const deleteCoach = catchAsync(async (req, res) => {
  // Service-ga id va user ob'ektini uzatamiz
  await CoachService.delete(req.params.id, req.user);
  res.status(204).end();
});

const coachController = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = coachController;
