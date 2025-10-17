import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuestionType, SessionStatus } from '@prisma/client';

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitAnswer(teamId: string, submitAnswerDto: SubmitAnswerDto) {
    const { sessionId, questionId, answerPayload } = submitAnswerDto;

    const [session, question, existingAnswer] = await Promise.all([
      this.prisma.quizSession.findUnique({ where: { id: sessionId } }),
      this.prisma.question.findUnique({ where: { id: questionId } }),
      this.prisma.answer.findUnique({
        where: {
          sessionId_questionId_teamId: {
            sessionId,
            questionId,
            teamId,
          },
        },
      }),
    ]);

    if (existingAnswer) {
      throw new ConflictException(
        'You have already answered this question in this session.',
      );
    }

    if (!session) {
      throw new NotFoundException(`Quiz session with ID "${sessionId}" not found.`);
    }

    if (!question) {
      throw new NotFoundException(`Question with ID "${questionId}" not found.`);
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new ForbiddenException(
        `Quiz session "${session.sessionCode}" is not active.`,
      );
    }

    if (session.quizId !== question.quizId) {
      throw new ForbiddenException('Question does not belong to this quiz session.');
    }

    let isCorrect = false;
    let pointsAwarded = 0;
    
    try {
      const correctAnswer = question.correctAnswer as Record<string, any>;

      if (
        !correctAnswer ||
        typeof correctAnswer !== 'object' ||
        Array.isArray(correctAnswer)
      ) {
        throw new Error('Internal: Correct answer is not a valid object.');
      }

      if (
        !answerPayload ||
        typeof answerPayload !== 'object' ||
        Array.isArray(answerPayload)
      ) {
        throw new Error('Answer payload must be a valid object.');
      }

      if (question.type === QuestionType.MCQ) {
        if (typeof answerPayload.id !== 'string') {
          throw new Error(
            'Invalid payload for MCQ question. Expecting { "id": "string" }.',
          );
        }
        if (typeof correctAnswer.id !== 'string') {
          throw new Error('Internal: Correct answer for MCQ is missing "id".');
        }
        isCorrect = correctAnswer.id === answerPayload.id;
      } else if (question.type === QuestionType.TF) {
        if (typeof answerPayload.value !== 'boolean') {
          throw new Error(
            'Invalid payload for TF question. Expecting { "value": boolean }.',
          );
        }
        if (typeof correctAnswer.value !== 'boolean') {
          throw new Error(
            'Internal: Correct answer for TF is missing "value".',
          );
        }
        isCorrect = correctAnswer.value === answerPayload.value;
      } else {
        this.logger.warn(
          `Unsupported question type for answer submission: ${question.type}`,
        );
      }

      if (isCorrect) {
        // Get all correct answers for this question in this session
        const correctAnswers = await this.prisma.answer.findMany({
          where: {
            sessionId,
            questionId,
            isCorrect: true,
          },
          orderBy: {
            answeredAt: 'asc',
          },
        });

        // If this is the first correct answer
        if (correctAnswers.length === 0) {
          pointsAwarded = question.points;
        } else {
          // Calculate time difference from the first correct answer (in seconds)
          const firstAnswerTime = correctAnswers[0].answeredAt.getTime();
          const currentAnswerTime = new Date().getTime();
          const timeDifferenceInSeconds = (currentAnswerTime - firstAnswerTime) / 1000;

          // Calculate decreasing points based on time difference
          // Points decrease by 10% every 5 seconds, with a minimum of 10% of original points
          const decayFactor = Math.max(0.1, 1 - (Math.floor(timeDifferenceInSeconds / 5) * 0.1));
          pointsAwarded = Math.round(question.points * decayFactor);
        }
      }
    } catch (error) {
      throw new BadRequestException(
        (error instanceof Error ? error.message : 'Invalid answer payload structure.'),
      );
    }

    const savedAnswer = await this.prisma.answer.create({
      data: {
        teamId,
        questionId,
        sessionId,
        answerPayload,
        isCorrect,
        pointsAwarded,
      },
    });

    let message = isCorrect ? 'Correct answer! ' : 'Incorrect answer.';
    if (isCorrect && savedAnswer.pointsAwarded < question.points) {
      message += `You earned ${savedAnswer.pointsAwarded} points (reduced due to answer timing).`;
    }

    return {
      answerId: savedAnswer.id,
      isCorrect: savedAnswer.isCorrect,
      pointsAwarded: savedAnswer.pointsAwarded,
      submittedAt: savedAnswer.answeredAt,
      message,
    };
  }
}