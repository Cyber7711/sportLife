const Coach = require("../model/coach");

async function create(data) {
  const coach = await Coach.create(data);
  return coach;
}

async function findAll(filter = {}) {
  const finalFilter = { isActive: true, ...filter };
  return await Coach.find(finalFilter);
}

async function findById(id) {
  const coach = await Coach.findOne({ _id: id, isActive: true });
  return coach;
}

async function update(id, updateData) {
  const coach = await Coach.findByIdAndUpdate(id, updateData, { new: true });
  return coach;
}

async function deleteById(id) {
  const coach = await Coach.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return coach;
}

const coachRepository = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};

module.exports = coachRepository;
