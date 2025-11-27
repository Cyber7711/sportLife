const mongoose = require("mongoose");
const AppError = require("./appError");

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNUmber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function assertSportsmanArray(arr) {
  if (!Array.isArray(arr)) {
    throw new AppError("Sportsman array bulishi kerak");
  }

  return arr.map((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Sportsman array ichida noto‘g‘ri ObjectId mavjud");
    }
    return mongoose.Types.ObjectId(id);
  });
}

const validators = {
  isPositiveNUmber,
  assertValidId,
  assertSportsmanArray,
  isNonEmptyString,
};

module.exports = validators;
