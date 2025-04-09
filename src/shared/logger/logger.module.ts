import { Module, Global } from '@nestjs/common';
import { CustomLogger } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: CustomLogger,
      useFactory: () => new CustomLogger(),
    },
  ],
  exports: [CustomLogger],
})
export class LoggerModule {} 