import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Debug middleware (production'da kaldırılabilir)
  if (process.env.NODE_ENV === 'development') {
    app.use((req: any, _res: any, next: any) => {
      if (req.headers.authorization) {
        console.log('🔐 AUTH HEADER:', req.headers.authorization);
        console.log('🔍 URL:', req.url);
      }
      next();
    });
  }

  // ---- Swagger ----
   const config = new DocumentBuilder()
  .setTitle('HSD Arena API')
  .setDescription('Quiz API Documentation')
  .setVersion('0.1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'team-token'
  )
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'admin-token'
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // http://localhost:8080/docs

  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
