import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AnswerService {
constructor(private prisma: PrismaService) {}

async submit(dto: SubmitAnswerDto, teamId: string) {
  const { sessionId, questionId, answerPayload, nonce } = dto;

  // 1. Session'ı kontrol et
  const session = await this.prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { quiz: true }
  });
  if (!session) {
    throw new NotFoundException('Session not found');
  }

  // 2. Question'ı kontrol et
  const question = await this.prisma.question.findUnique({
    where: { id: questionId }
  });
  if (!question) {
    throw new NotFoundException('Question not found');
  }

  // 3. Question'ın bu session'a ait olduğunu kontrol et
  if (question.quizId !== session.quizId) {
    throw new NotFoundException('Question does not belong to this session');
  }

  // 4. Team ID artık parametre olarak geliyor

  // 5. Duplicate submission kontrolü
  const existingAnswer = await this.prisma.answer.findUnique({
    where: {
      sessionId_questionId_teamId: {
        sessionId,
        questionId,
        teamId
      }
    }
  });

  if (existingAnswer) {
    throw new ConflictException('Answer already submitted for this question');
  }

  // 6. Cevabı doğrula ve puan hesapla
  const isCorrect = this.validateAnswer(question, answerPayload);
  const pointsAwarded = isCorrect ? question.points : 0;

  // 7. Cevabı kaydet
  const answer = await this.prisma.answer.create({
    data: {
      sessionId,
      questionId,
      teamId,
      answerPayload,
      isCorrect,
      pointsAwarded,
      answeredAt: new Date()
    }
  });

  return {
    answerId: answer.id,
    isCorrect,
    pointsAwarded,
    submittedAt: answer.answeredAt,
    message: isCorrect ? 'Correct answer!' : 'Incorrect answer'
  };
}

private validateAnswer(question: any, answerPayload: any): boolean {
  switch (question.type) {
    case 'MCQ':
      return question.correctAnswer.id === answerPayload.id;
    case 'TF':
      return question.correctAnswer.value === answerPayload.value;
    default:
      return false;
  }
}
}