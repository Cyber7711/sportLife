const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Coach = require("../model/coach");
const validators = require("../utils/validators");

async function createCoach(data) {
  const { specialization, experience, sportsman } = data;
  const missing = [];

  if (!validators.isNonEmptyString(specialization))
    missing.push("specialization");
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
  if (Array.isArray(sportsman) && sportsman.length > 0) {
    sportsmanIds = validators.assertSportsmanArray(sportsman);
  }
  const payload = {
    specialization: specialization.trim(),
    experience,
    ...(sportsmanIds ? { sportsman: sportsmanIds } : {}),
    isActive: true,
  };

  const coach = await Coach.create(payload);
  return coach.toObject();
}

async function getAllCoaches(options = {}) {
  const { page = 1, limit = 20, specialization } = options;

  const filter = { isActive: true };
  if (validators.isNonEmptyString(specialization)) {
    filter.specialization = { $regex: specialization.trim(), $options: "i" };
  }

  const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

  const [items, total] = await Promise.all([
    Coach.find(filter)
      .select("specialization experience sportsman createdAt")
      .populate("sportsman", "name email")
      .skip(skip)
      .limit(Math.max(limit, 1))
      .lean(),

    Coach.countDocuments(filter),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data: items,
  };
}

async function getCoachById(id) {
  validators.assertValidId(id);
  const coach = await Coach.findOne({ _id: id, isActive: true })
    .select("-__v")
    .populate("sportsman", "name email")
    .lean();

  if (!coach) {
    throw new AppError("Bunday murabbiy topilmadi", 404);
  }
  return coach;
}

async function updateCoach(id, updateData = {}) {
  validators.assertValidId(id);
  const allowedFields = ["specialization", "experience", "sportsman"];
  const filtered = {};

  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      const val = updateData[key];
      if (key === "specialization") {
        condition;
        if (!validators.isNonEmptyString(val))
          throw new AppError("Specialization notugri", 400);
        filtered.specialization = val.trim();
      } else if (key === "experience") {
        if (typeof val !== "number" || !Number.isFinite(val) || val < 1) {
          throw new AppError("Experience notugri", 400);
        }
        filtered.experience = val;
      } else if (key === "sportsman") {
        if (!Array.isArray(val))
          throw new AppError("Sportchi array bulishi kerak", 400);
        filtered.sportsman = val.map((s) => {
          if (!mongoose.Types.ObjectId.isValid(s)) {
            throw new AppError(
              "Sportsman array ichida noto'g'ri ObjectId mavjud",
              400
            );
          }
          return mongoose.Types.ObjectId(s);
        });
      }
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError("Yangilanish uchun hech qanday maydonlar topilmadi");
  }

  const coach = await Coach.findOneAndUpdate(
    { _id: id, isActive: true },
    filtered,
    { new: true, runValidators: true }
  ).populate("sportsman", "name email");

  if (!coach) {
    throw new AppError(
      "Murabbiyni yangilashda xatolik yoki murabbiy mavjud emas",
      404
    );
  }
  return coach.toObject();
}

async function deleteCoach(id) {
  validators.assertValidId(id);

  const coach = await Coach.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );
  if (!coach) {
    throw new AppError(
      "Murabbiyni uchirishda xatolik yoki murabbiy mavjuda emas ",
      404
    );
  }
  return { message: "Murabbiy muvaffaqiyatli uchirildi" };
}

const CoachService = {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
};

module.exports = CoachService;
