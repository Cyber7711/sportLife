const { default: mongoose } = require("mongoose");
const AppError = require("../utils/appError");
const Sportsman = require("../model/sportsman");

async function createSportsman(data) {
  const { sportType, coach, height, weight, achievements } = data;
  const missing = [];

  if (missing.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) tuldirilmagan: ${missing.join(", ")} `,
      400
    );
  }

  const sportsman = new Sportsman.find({
    sportType,
    coach,
    height,
    weight,
    achievements,
  });
  return await sportsman.save();
}

async function getAllSportsmen() {
  const sportsman = await Sportsman.find({ isActive: true });
  return sportsman;
}

async function getSportsmanById(id) {
  if (!mongoose.Types.ObjectId.isValid) {
    throw new AppError("ID formati notuugri", 400);
  }
  const sportsman = await Sportsman.findById(id);
  if (!sportsman) {
    throw new AppError("Bunday Sportchi yoq", 400);
  }
  return sportsman;
}

async function updateSportsman(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid) {
    throw new AppError("ID formati notuugri", 400);
  }

  const allowedFields = [
    "sportType",
    "coach",
    "height",
    "weight",
    "achievements",
  ];
  const filtered = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filtered[key] = updateData[key];
    }
  }

  const sportsman = await Sportsman.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!sportsman) {
    throw new AppError("Sportchini yangilab bulmadi", 400);
  }

  return sportsman;
}

async function deleteSportsman(id) {
  if (!mongoose.Types.ObjectId.isValid) {
    throw new AppError("ID formati notuugri", 400);
  }

  const sportsman = await Sportsman.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!sportsman) {
    throw new AppError("Sportchini yangilab bulmadi", 400);
  }
  return sportsman;
}

const sportsmanService = {
  createSportsman,
  getAllSportsmen,
  getSportsmanById,
  updateSportsman,
  deleteSportsman,
};

module.exports = sportsmanService;
