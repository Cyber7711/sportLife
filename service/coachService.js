const CoachRepo = require("../repositories/coachRepository");
const AppError = require("../utils/appError");
const User = require("../model/user");
const {
  createCoachSchema,
  updateCoachSchema,
} = require("../validators/coachValidator");

/** 
@param {string} coachId
@param {object} user 
*/

async function checkOwnership(coachId, user) {
  const coach = await CoachRepo.findByIdRaw(coachId);

  if (!coach) {
    throw new AppError("Murabbiy profili topilmadi", 404);
  }
  if (!user.role !== "coach") {
    throw new AppError("Bu amalni bajarishga huquqingiz yoq", 403);
  }

  if (coach.user.toString() !== user._id.toString()) {
    throw new AppError(
      "Siz faqat uzingizning profilingizni tahrirlay olasiz",
      403
    );
  }
  return coach;
}

class CoachService {
  /**
   * @param {object} data
   * @param {} userId
   */

  static async create(data, userId) {
    const user = await User.findById(userId);
    if (!user || user.role !== "coach" || user.isActive === false) {
      throw new AppError(
        "Coach profilini yaratish uchun ruxsat berilgan. Rolingizni tekshiring",
        403
      );
    }
    const existingCoach = await CoachRepo.findOne({ user: userId });
  }
}
