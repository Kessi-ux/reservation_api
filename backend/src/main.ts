import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Product Reservation API')
    .setDescription(
      'API for managing products, reservations, checkout, and inventory.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  app.useLogger(app.get(Logger));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
