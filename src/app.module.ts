import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { getConnection } from 'typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import type { RedisClientOptions } from 'redis';
import type { CacheStore } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { CustomLogger } from './shared/logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('database');
        return {
          ...config,
          extra: {
            ...config.extra,
            init: async (connection) => {
              try {
                await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
              } catch (error) {
                // We'll handle this in onModuleInit
              }
            }
          }
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('redis');
        const store = await redisStore({
          url: config.url,
          ttl: config.ttl,
        });
        return {
          store: store as unknown as CacheStore,
          max: config.max,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BlogsModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [{
          ttl: config.get('app.rateLimit.ttl'),
          limit: config.get('app.rateLimit.limit'),
        }],
      }),
    }),
    SharedModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger
  ) {
    this.logger.setContext('AppModule');
  }

  async onModuleInit() {
    try {
      const connection = getConnection();
      await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (error) {
      this.logger.warn('Creating extension failed (might already exist)');
    }
  }
}
