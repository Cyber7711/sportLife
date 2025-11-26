const sportsmanService = require("../service/sportsmanService");
const AppError = require("../utils/appError");

const createSportsman = async (req, res, next) => {
  try {
    const result = await sportsmanService.createSportsman(req.body);
    if (!result) {
      throw new AppError("Sportchi yaratishda xatolik", 401);
    }
    res
      .status(201)
      .json({
        success: true,
        message: "Sportchi muvaffaqiyatli yaratildi",
        data: result,
      });
  } catch (err) {
    return next(err);
  }
};
