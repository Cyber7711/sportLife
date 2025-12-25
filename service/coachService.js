const repo = require("../repositories/coachRepository"); // Nomi to'g'rilandi
const AppError = require("../utils/appError");
const User = require("../model/user");
const {
  createCoachSchema,
  updateCoachSchema,
} = require("../validators/coachValidator");

async function checkOwnership(coachId, user) {
  const coach = await repo.findByIdRaw(coachId);

  if (!coach) {
    throw new AppError("Murabbiy profili topilmadi", 404);
  }

  if (user.role === "admin") return coach;

  if (user.role !== "coach") {
    throw new AppError("Bu amalni bajarishga huquqingiz yo'q", 403);
  }

  if (coach.user.toString() !== user._id.toString()) {
    throw new AppError(
      "Siz faqat o'zingizning profilingizni tahrirlay olasiz",
      403
    );
  }
  return coach;
}

class CoachService {
  static async create(data, userId) {
    const user = await User.findById(userId);

    if (!user || user.role !== "coach" || user.isActive === false) {
      throw new AppError("Murabbiy profilini yaratish uchun ruxsat yo'q.", 403);
    }

    const existingCoach = await repo.findOne({ user: userId });
    if (existingCoach) {
      throw new AppError("Sizda allaqachon murabbiy profili mavjud", 400);
    }

    const parsed = createCoachSchema.safeParse(data);

    const coachData = { ...parsed.data, user: userId };
    return await repo.create(coachData);
  }

  static async getAll(queryParams) {
    const { page, limit, search, specialization, sportType } = queryParams;

    const filter = { isActive: true };
    if (specialization) filter.specialization = specialization;
    if (sportType) filter.sportTypes = { $in: [sportType] };

    return await repo.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      filter,
      populate: { path: "user", select: "fullName email phone" },
    });
  }

  static async getById(id) {
    const coach = await repo.findById(id, {
      populate: { path: "user", select: "fullName email phone" },
    });

    if (!coach) throw new AppError("Murabbiy topilmadi", 404);
    return coach;
  }

  static async update(id, data, user) {
    await checkOwnership(id, user);

    const parsed = updateCoachSchema.safeParse(data);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    return await repo.update(id, parsed.data);
  }

  static async delete(id, user) {
    if (user.role !== "admin") {
      await checkOwnership(id, user);
    }

    return await repo.softDelete(id);
  }
}

module.exports = CoachService;
