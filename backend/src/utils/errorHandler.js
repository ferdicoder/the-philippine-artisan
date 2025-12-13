export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  res.status(status).json({
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
}

export function createHttpError(status, message, details) {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  return e;
}
