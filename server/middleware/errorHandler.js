const errorHandler = (err, req, res, next) => {
  // If status code is still 200, default to 500 Server Error
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Hide stack trace in production for security
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
