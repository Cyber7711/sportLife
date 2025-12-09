const Sportsman = require("../model/sportsman");

const repo = {
  create: (data) => Sportsman.create(data),

  findAll: (filter = {}) =>
    Sportsman.find({ ...filter, isActive: true }).lean(),

  findById: (id) => Sportsman.findById(id).lean(),

  findOne: (filter) => Sportsman.findOne({ ...filter, isActive: true }).lean(),

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
