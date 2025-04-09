import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from './shared/logger/logger.service';
import helmet from 'helmet';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger('Bootstrap'),
  });
  const configService = app.get(ConfigService);
  const logger = app.get(CustomLogger);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('app.cors.origin') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
      }));
      return new BadRequestException({
        message: 'Validation failed',
        errors: result,
      });
    },
  }));

  const config = new DocumentBuilder()
    .setTitle(configService.get('app.swagger.title') || 'Blog Management System API')
    .setDescription(configService.get('app.swagger.description') || 'API documentation for the Blog Management System')
    .setVersion(configService.get('app.swagger.version') || '1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  });
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  const port = configService.get('app.port') ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
