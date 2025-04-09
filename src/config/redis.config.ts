import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  ttl: process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 5000,
  max: process.env.REDIS_MAX ? parseInt(process.env.REDIS_MAX, 10) : 100,
})); 