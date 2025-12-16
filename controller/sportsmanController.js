const catchAsync = require("../middleware/asyncWrapper");
const sendResponse = require("../middleware/sendResponse");
const SportsmanService = require("../service/sportsmanService");

const create = catchAsync(async (req, res) => {
  const result = await SportsmanService.create(req.body, req.user?._id);
  sendResponse(res, {
    status: 201,
    message: "Sportsman muvaffaqiyatli yaratildi",
    data: result,
  });
});

const getAll = catchAsync(async (req, res) => {
  const result = await SportsmanService.getAll(req.query);
  sendResponse(res, {
    status: 200,
    message: "Sportchilar muvaffaqiyatli olindi",
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await SportsmanService.getById(req.params.id);
  sendResponse(res, {
    status: 200,
    message: "Sportchi muvaffaqiyatli olindi",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  const result = await SportsmanService.update(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    status: 200,
    message: "Sportchi muvaffaqiyatli yangilandi",
    data: result,
  });
});

const deleted = catchAsync(async (req, res) => {
  const result = await SportsmanService.delete(req.params.id, req.user);
  sendResponse(res, {
    status: 204,
    message: "Sportchi muvaffaqiyatli uchirildi",
  });
});

const SportsmanController = {
  create,
  getAll,
  getById,
  update,
  deleted,
};

module.exports = SportsmanController;
