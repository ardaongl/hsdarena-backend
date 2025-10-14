import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AppController } from './app.controller';


@Module({
imports: [
ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
PrismaModule,
RedisModule,
AuthModule,
QuizModule,
RealtimeModule
],
controllers: [AppController], 
})
export class AppModule {}