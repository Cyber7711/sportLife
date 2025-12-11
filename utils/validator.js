const validator = require("validator");

const sanitizeString = (val) => {
  if (typeof val !== "string") {
    return val;
  }
  return validator.escape(val);
};

module.exports = sanitizeString;
