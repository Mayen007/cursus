export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === "ValidationError") {
    error.status = 400;
    error.message = "Please check the submitted details.";
    error.details = Object.values(error.errors).map(({ message }) => message);
  }
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? "Internal server error." : error.message;

  if (status >= 500) {
    console.error("Unhandled server error.");
  }

  res.status(status).json({
    error: message,
    details: Array.isArray(error.details) ? error.details : [],
  });
}
