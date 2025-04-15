import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from './clients/redis';
import Boom from '@hapi/boom';

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args), // ⬅️ Thay đổi này cần nếu dùng ioredis
    resetExpiryOnChange: true,
    expiry: 30,
  }),
  max: 1000,
  handler: (req, res, next) => {
    next(Boom.tooManyRequests());
  },
});

export default limiter;
