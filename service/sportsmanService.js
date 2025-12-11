const AppError = require("../utils/appError");
const SportsmanRepo = require("../repositories/sportsmanRepository");
const {
  createSportsmanSchema,
  updateSportsmanSchema,
} = require("../validators/sportsmanValidator");

/**
 * @param {string} sportsmanId - O‘zgartirilayotgan sportchining ID'si
 * @param {object} user - Kirgan foydalanuvchi (req.user)
 * @returns {object} - Topilgan Sportsman obyekti (agar ruxsat berilsa)
 */
async function checkOwnership(sportsmanId, user) {
  const sportsman = await SportsmanRepo.findById(sportsmanId);

  if (!sportsman) {
    throw new AppError("Sportchi topilmadi", 404);
  }

  if (user.role === "admin") {
    return sportsman;
  }

  if (user.role === "coach") {
    if (sportsman.coach && sportsman.coach.toString() === user._id.toString()) {
      return sportsman;
    } else {
      throw new AppError(
        "Bu sportchini tahrirlash yoki o‘chirishga huquqingiz yo‘q. (Faqat o‘z shogirdlaringizni boshqara olasiz)",
        403
      );
    }
  }
  throw new AppError("Bu amalni bajarishga ruxsat berilmagan", 403);
}

class SportsmanService {
  static async create(data, userId) {
    const parsed = createSportsmanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(" | ");
      throw new AppError(errors, 400);
    }
    return await SportsmanRepo.create({
      ...parsed.data,
      createdBy: userId,
    });
  }

  static async getAll(query) {
    return await SportsmanRepo.findAll({
      filter: {
        sportType: query.sportType,
        coach: query.coach,
        category: query.category,
      },
      search: query.search,
      populate: "coach",
      select: "-medicalInfo -isActive",
      page: +query.page ?? 1,
      limit: +query.limit ?? 20,
      sort: query.sort || { createdAt: -1 },
    });
  }
  static async getById(id) {
    const sportsman = await SportsmanRepo.findById(id, { populate: "coach" });
    if (!sportsman) {
      throw new AppError("Sportchi topilmadi", 404);
    }
    return sportsman;
  }

  static async update(id, data, user) {
    await checkOwnership(id, user);

    const parsed = await updateSportsmanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(" | ");
      throw new AppError(errors, 400);
    }
    const updated = await SportsmanRepo.update(id, parsed.data);

    return updated;
  }

  static async delete(id, user) {
    await checkOwnership(id, user);

    const deleted = await SportsmanRepo.softDelete(id);

    return { message: "Sportchi muvaffaqiyatli uchirildi" };
  }
}

module.exports = SportsmanService;
