import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // Import json and urlencoded

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend
  app.enableCors({
    origin: 'http://localhost:3001',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Increase payload size limit
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(3000);
}
bootstrap();
