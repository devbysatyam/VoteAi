/**
 * Global Error Handler — catches all unhandled Express errors.
 * Hides stack traces in production to prevent information leakage.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('Server error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
