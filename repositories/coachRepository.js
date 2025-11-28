const Coach = require("../model/coach");

const baseQuery = () => Coach.find();

const create = (data) => Coach.create(data);

const findAll = (filter = {}) => Coach.find(filter);

const findOne = (filter = {}) => Coach.findOne(filter);

const findById = (id) => Coach.findById(id);

const update = (id, updateData, options = { new: true }) =>
  Coach.findOneAndUpdate({ _id: id }, updateData, options);

const deleteById = (id) =>
  Coach.findOneAndUpdate({ _id: id }, { isActive: false }, { new: true });

module.exports = {
  baseQuery,
  create,
  findAll,
  findOne,
  findById,
  update,
  deleteById,
};
