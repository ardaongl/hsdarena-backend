import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { TeamJwtGuard } from '../common/guards/team-jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Define a type for the user object attached to the request
interface AuthenticatedRequest extends Request {
  user: {
    teamId: string;
    sessionId: string;
  };
}

@ApiTags('Answer')
@Controller('answer')
@ApiBearerAuth('team-token') // Sadece team token ile erişilebilir
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @HttpCode(200) // The task doc shows a 200 OK with a body, not 201 Created
  @UseGuards(TeamJwtGuard)
  @ApiOperation({ summary: 'Submit an answer for a quiz question' })
  @ApiResponse({
    status: 200,
    description: 'Answer submitted successfully and result returned.',
    schema: {
      example: {
        answerId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        isCorrect: true,
        pointsAwarded: 100,
        submittedAt: '2025-10-14T13:30:00.000Z',
        message: 'Correct answer!',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid payload or parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Team token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 
      'Forbidden - Session is not active or question does not belong to the session.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Session or question not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Answer already submitted.',
  })
  async submitAnswer(
    @Req() req: AuthenticatedRequest,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    const teamId = req.user.teamId;
    // Optional: You could also validate that the sessionId from the token matches the one in the body
    // if (req.user.sessionId !== submitAnswerDto.sessionId) { ... }
    return this.answerService.submitAnswer(teamId, submitAnswerDto);
  }
}