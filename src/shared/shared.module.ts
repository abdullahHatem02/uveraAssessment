import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomLogger } from './logger/logger.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [LoggerModule],
})
export class SharedModule {} 