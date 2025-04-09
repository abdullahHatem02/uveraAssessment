import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context || this.context || 'Application';
    return `[${timestamp}] [${contextStr}] ${message}`;
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage(message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage(message, context));
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage(message, context));
  }

  debug(message: any, context?: string) {
    console.debug(this.formatMessage(message, context));
  }

  verbose(message: any, context?: string) {
    console.info(this.formatMessage(message, context));
  }

  setContext(context: string) {
    this.context = context;
  }
} 