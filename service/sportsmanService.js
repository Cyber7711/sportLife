const AppError = require("../utils/appError");
const SportsmanRepo = require("../repositories/sportsmanRepository");
const {
  createSportsmanSchema,
  updateSportsmanSchema,
} = require("../validators/sportsmanValidator");

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
  static async update(id, data) {
    const parsed = await updateSportsmanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(" | ");
      throw new AppError(errors, 400);
    }
    const updated = await SportsmanRepo.update(id, parsed.data);
    if (!updated) throw new AppError("Sportchi topilmadi", 404);
    return updated;
  }

  static async delete(id) {
    const deleted = await SportsmanRepo.softDelete(id);
    if (!deleted) throw new AppError("Sportchi topilmadi", 404);
    return { message: "Sportchi muvaffaqiyatli uchirildi" };
  }
}

module.exports = SportsmanService;
