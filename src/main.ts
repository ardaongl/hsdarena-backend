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
  .setTitle('Quiz Backend API')
  .setDescription('Kahoot-benzeri quiz platformu için REST & WS API')
  .setVersion('0.1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Bu alana SADECE ham token girin. "Bearer " yazmayın. (Team endpoint\'leri için)',
    },
    'team-token', // <-- team endpoint'leri için
  )
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Bu alana SADECE ham token girin. "Bearer " yazmayın. (Admin endpoint\'leri için)',
    },
    'admin-token', // <-- admin endpoint'leri için
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // http://localhost:8080/docs

  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
