const crypto = require("crypto");

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || [""];
};
