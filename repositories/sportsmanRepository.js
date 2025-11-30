const Sportsman = require("../model/sportsman");

const baseQuery = () => Sportsman.find();

const create = (data) => Sportsman.create(data);

const findAll = (filter = {}) => Sportsman.find(filter);

const findOne = (filter = {}) => Sportsman.findOne(filter);

const findById = (id) => Sportsman.findById(id);

const update = (id, updateData, options = { new: true }) =>
  Sportsman.findOneAndUpdate({ _id: id }, updateData, options);

const deleteById = (id) =>
  Sportsman.findOneAndUpdate({ _id: id }, { isActive: false }, { new: true });

const sportsmanRepository = {
  baseQuery,
  create,
  findAll,
  findById,
  findOne,
  update,
  deleteById,
};

module.exports = sportsmanRepository;
