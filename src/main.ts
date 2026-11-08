import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { TransformResponseInterceptor } from './interceptors/transform-response/transform-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // dan tolak request yang membawanya
      transform: true, // ubah payload/query menjadi instance DTO dan tipe yang benar
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // CORS hanya dibutuhkan dashboard web (mobile tidak terkena aturan CORS)
  const origins = config.get<string>('CORS_ORIGINS', 'http://localhost:5173').split(',');
  app.enableCors({ origin: origins, credentials: true });

  const swagger = new DocumentBuilder()
    .setTitle('Wedding+ API')
    .setDescription('API untuk aplikasi mobile (Flutter) dan dashboard web (admin & vendor)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(config.get<number>('PORT', 3000));
}
await bootstrap();
