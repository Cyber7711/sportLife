const { default: mongoose } = require("mongoose");
const AppError = require("../utils/appError");
const Coach = require("../model/coach");

async function createCoach(data) {
  const { specialization, experience } = data;
  const missingFields = [];

  if (!specialization) missingFields.push("specialization");
  if (!experience) missingFields.push("experience");

  if (missingFields.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) tuldirilmagan: ${missingFields.join(", ")}`,
      400
    );
  }

  const coach = new Coach.find({ specialization, experience });
  return await coach.save();
}

async function getAllCoaches() {
  const coaches = await Coach.find({ isActive: true });
  return coaches;
}

async function getCoachById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const coach = await Coach.findById(id);
  if (!coach) {
    throw new AppError("Bunday murabbiy yoq", 400);
  }
  return coach;
}

async function updateCoach(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri");
  }
  const allowedFields = ["specialization", "experience"];
  const filtered = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filtered[key] = updateData[key];
    }
  }

  const coach = await Coach.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!coach) {
    throw new AppError("Murabbiyni yangilab bulmadi", 400);
  }
  return coach;
}

async function deleteCoach(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri");
  }

  const coach = await Coach.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!coach) {
    throw new AppError("Murabbiyni uchirib bulmadi", 400);
  }
  return;
  {
    message: "Murabbiy muvaffaqiyatli uchirildi";
  }
}

const CoachService = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = CoachService;
