const sendResponse = (res, { status = 200, message = "OK", data = null }) => {
  const isSuccess = status >= 200 && status < 400;
  res.status(status).json({
    success: isSuccess,
    message,
    ...(data !== null && { data }),
    timestamp: new Date().toISOString(),
  });
};

module.exports = sendResponse;
