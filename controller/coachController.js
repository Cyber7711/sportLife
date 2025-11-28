const CoachService = require("../service/coachService");

const createCoach = async (req, res, next) => {
  try {
    const result = await CoachService.createCoach(req.body);
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
    if (!result?.data?.length === 0) {
      res.status(200).json({
        message: "Hozircha murabbiylar yuq",
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
