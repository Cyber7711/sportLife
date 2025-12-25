const Sportsman = require("../model/sportsman");

const repo = {
  create: (data) => Sportsman.create(data),

  findAll: (filter = {}) =>
    Sportsman.find({ ...filter, isActive: true }).lean(),
  findMySportsmen: async (coachProfileId) => {
    return await Sportsman.find({
      coach: coachProfileId,
      isActive: true,
    })
      .select("name surname birthDate sportType weight height")
      .sort({ createdAt: -1 });
  },
  findById: (id) => Sportsman.findById(id).lean(),

  findOne: (filter) => Sportsman.findOne({ ...filter, isActive: true }).lean(),

  updateByUserId: async (userId, data) => {
    return await Sportsman.findOneAndUpdate({ user: userId }, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  update: (id, data) =>
    Sportsman.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean(),

  softDelete: (id) =>
    Sportsman.findByIdAndUpdate(
      id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    ).lean(),
};

module.exports = repo;
