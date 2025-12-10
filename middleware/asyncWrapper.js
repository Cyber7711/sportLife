const catchAsync = (fn) => {
  return async (req, res, next) => {
    const start = performance.now();

    try {
      await fn(req, res, next);
    } catch (err) {
      return next(err);
    } finally {
      const end = performance.now();
      const time = (end - start).toFixed(2);
      console.log(
        `[PERF] ${req.method} ${
          req.originalUrl
        } | ${time}ms | ${new Date().toISOString()}`,
      );
    }
  };
};

module.exports = catchAsync;
