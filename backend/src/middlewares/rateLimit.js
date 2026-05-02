const buckets = new Map();

const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 20;

const getClientKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  return `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
};

const pruneExpiredBuckets = (now) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

const formatRetryAfter = (seconds) => {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`;
};

export const createRateLimit = ({
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
  message = 'Too many requests. Please wait a moment and try again.',
} = {}) => {
  const resolvedWindowMs = Number(windowMs) || DEFAULT_WINDOW_MS;
  const resolvedMaxRequests = Number(maxRequests) || DEFAULT_MAX_REQUESTS;

  return (req, res, next) => {
    const now = Date.now();
    const clientKey = getClientKey(req);
    const currentBucket = buckets.get(clientKey);
    const bucket =
      currentBucket && currentBucket.resetAt > now
        ? currentBucket
        : {
            count: 0,
            resetAt: now + resolvedWindowMs,
          };

    bucket.count += 1;
    buckets.set(clientKey, bucket);
    pruneExpiredBuckets(now);

    const remaining = Math.max(0, resolvedMaxRequests - bucket.count);
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', resolvedMaxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > resolvedMaxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        message: `${message} Try again in ${formatRetryAfter(retryAfterSeconds)}.`,
        retryAfter: retryAfterSeconds,
        resetAt: bucket.resetAt,
      });
    }

    return next();
  };
};

export const chatRateLimit = createRateLimit({
  windowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || DEFAULT_WINDOW_MS),
  maxRequests: Number(
    process.env.CHAT_RATE_LIMIT_MAX_REQUESTS || DEFAULT_MAX_REQUESTS
  ),
});
