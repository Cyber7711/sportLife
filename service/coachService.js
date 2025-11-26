const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Coach = require("../model/coach");

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

async function createCoach(data) {
  const { specialization, experience, sportsman } = data;
  const missing = [];

  if (!isNonEmptyString(specialization)) missing.push("specialization");
  if (
    typeof experience !== "number" ||
    !Number.isFinite(experience) ||
    experience < 1
  )
    missing.push("experience");

  if (missing.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) to'ldirilmagan yoki noto'g'ri: ${missing.join(
        ", "
      )}`,
      400
    );
  }

  let sportsmanIds = undefined;
  if (Array.isArray(sportsman)) {
  }

  const coach = new Coach.find({ specialization, experience, sportsman });
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

  const coach = await Coach.findOne(id, { isActive: false }, { new: true });
  if (!coach) {
    throw new AppError("Murabbiyni uchirib bulmadi", 400);
  }
  return coach;
}

const CoachService = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = CoachService;
