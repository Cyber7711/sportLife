const catchAsync = require("../middleware/asyncWrapper");
const sendResponse = require("../middleware/sendResponse");
const SportsmanService = require("../service/sportsmanService");

const create = catchAsync(async (req, res) => {
  const result = await SportsmanService.create(req.body, req.user._id);
  sendResponse(res, {
    status: 201,
    message: "Sportsman muvaffaqiyatli yaratildi",
    data: result,
  });
});

const getAll = catchAsync(async (req, res) => {
  const result = await SportsmanService.getAll();
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
// https://www.instagram.com/reel/DPybfIdj_Z3/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DQUDyyADcJV/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DL_caZMI83q/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DRBZbWTiPi3/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
