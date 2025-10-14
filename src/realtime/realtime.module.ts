import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';


@Module({ providers: [QuizGateway], exports: [QuizGateway] })
export class RealtimeModule {}