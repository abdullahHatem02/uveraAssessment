import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  },
  rateLimit: {
    ttl: process.env.RATE_LIMIT_TTL ? parseInt(process.env.RATE_LIMIT_TTL, 10) : 60,
    limit: process.env.RATE_LIMIT_LIMIT ? parseInt(process.env.RATE_LIMIT_LIMIT, 10) : 10,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '1d',
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || 'Blog Management System API',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for the Blog Management System',
    version: process.env.SWAGGER_VERSION || '1.0',
  },
  hashCost: process.env.HASH_COST ? parseInt(process.env.HASH_COST, 10) : 10,
})); 