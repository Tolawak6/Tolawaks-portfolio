/**
 * Tiny request logger. Anything more elaborate (morgan, pino) would be an
 * extra dependency for very little gain at this size.
 */
export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const status = res.statusCode;
    const marker = status >= 500 ? '!!' : status >= 400 ? ' !' : '  ';
    console.log(
      `${marker} ${req.method.padEnd(6)} ${String(status).padEnd(3)} ${durationMs.toFixed(1).padStart(6)}ms  ${req.originalUrl}`,
    );
  });

  next();
}
