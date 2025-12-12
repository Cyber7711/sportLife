const Coach = require("../model/coach");

const repo = {
  create: (data) => Coach.create(data),

  findAll: (options = {}) => {
    const {
      filter = {},
      search,
      populate,
      select,
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
    } = options;

    let query = { ...filter };

    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: "i" } },
        { "license.number": { $regex: search, $option: "i" } },
      ];
    }
    query.isActive = { $ne: false };

    return Coach.find(query)
      .populate(populate)
      .select(select)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  },

  findById: (id, options = {}) =>
    Coach.findById(id).populate(options.populate).lean(),

  findOne: (filter, options = {}) =>
    Coach.findOne({ ...filter, isActive: true })
      .populate(options.populate)
      .lean(),

  update: (id, data) =>
    Coach.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean(),
  softDelete: (id) =>
    Coach.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean(),

  findByIdRaw: (id, options = {}) =>
    Coach.findById(id).populate(options.populate).lean(),
};

module.exports = repo;
