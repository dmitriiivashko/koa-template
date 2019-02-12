const NOCACHE = (process.env.NOCACHE || 'false') === 'true';
const CACHE_TIMEOUT_SECONDS = parseInt(process.env.CACHE_TTL || '3600', 10);
const NAMESPACE = 'd0bdaad2-22f0-48f7-b714-7101e1fb309e';

const UUIDv5 = require('uuid/v5');

export const ApiCacheMiddleware = async (ctx, next) => {
  if (NOCACHE) {
    ctx.set('X-Cache', 'NOCACHE');
    await next();
    return;
  }

  const { redis, accessLog } = ctx.IoC;

  if (!redis) {
    ctx.set('X-Cache', 'IGNORE');
    await next();
    return;
  }

  const { method, url } = ctx;

  if (method.toLowerCase() !== 'get') {
    ctx.set('X-Cache', 'IGNORE');
    await next();
    return;
  }

  const cacheKey = `cache:${UUIDv5(url, NAMESPACE)}`;

  const cachedData = await redis.getAsync(cacheKey);
  if (cachedData) {
    accessLog.debug(`[CACHE] [${cacheKey}] [HIT]`);
    const parsedData = JSON.parse(cachedData);
    ctx.status = parsedData.status;
    ctx.body = parsedData.body;
    ctx.set(parsedData.headers);
    ctx.set('X-Cache', 'HIT');
    return;
  }

  await next();

  const data = {
    status: ctx.status,
    headers: ctx.response.headers,
    body: ctx.body,
  };

  accessLog.debug(`[CACHE] [${cacheKey}] [MISS]`);
  ctx.set('X-Cache', 'MISS');
  redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TIMEOUT_SECONDS);
};
