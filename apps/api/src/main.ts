/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const documentConfig = new DocumentBuilder()
    .setTitle('Tips API')
    .setDescription('Tips Human Source Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.setGlobalPrefix(globalPrefix);
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(globalPrefix, app, document);
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
