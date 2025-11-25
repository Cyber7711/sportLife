const CoachService = require("../service/coachService");
const AppError = require("../utils/appError");

const createCoach = async (req, res, next) => {
  try {
    const result = await CoachService.createCoach(req.body);
    if (!result) {
      throw new AppError("Murabbiy yaratib bulmadi", 400);
    }
    res.status(201).json({
      success: true,
      message: "Murabbiy muvaffaqiyatli yaratildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllCoaches = async (req, res, next) => {
  try {
    const result = await CoachService.getAllCoaches();
    if (!result || result.length === 0) {
      res.status(200).json({
        message: "hozircha murabbiylar yuq",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Murabbiylar muvaffqiyatli topildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getCoachById = async (req, res, next) => {
  try {
    const result = await CoachService.getCoachById(req.params.id);
    if (!result) {
      throw new AppError("Murabiyni olishda xatolik", 400);
    }
    res.status(200).json({
      success: true,
      message: "Murabbiy muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateCoach = async (req, res, next) => {
  try {
    const result = await CoachService.updateCoach(req.params.id, req.body);
    if (!result) {
      throw new AppError("Murabbiyni yangilashda xatolik", 400);
    }
    res.status(200).json({
      success: true,
      message: "Murabbiy muvaffaqiyatli yangilandi ",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteCoach = async (req, res, next) => {
  try {
    const result = await CoachService.deleteCoach(req.params.id);
    if (!result) {
      throw new AppError("Murabbiyni uchirishda xatolik", 400);
    }
    res
      .status(200)
      .json({ success: true, message: "Murabbiy muvaffaqiyatli uchirildi" });
  } catch (err) {
    return next(err);
  }
};

const coachController = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = coachController;
