import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamJwtGuard } from '../common/guards/team-jwt.guard';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('answer')
@ApiBearerAuth('team-token')
@Controller('answer')
export class AnswerController {
constructor(private readonly service: AnswerService) {}

@ApiOperation({ 
  summary: 'Submit answer to a question',
  description: 'Submit an answer to a specific question in a quiz session. Requires team authentication.'
})
@ApiResponse({ 
  status: 200, 
  description: 'Answer submitted successfully',
  schema: {
    type: 'object',
    properties: {
      answerId: { type: 'string', example: 'answer-uuid' },
      isCorrect: { type: 'boolean', example: true },
      pointsAwarded: { type: 'number', example: 100 },
      submittedAt: { type: 'string', format: 'date-time' },
      message: { type: 'string', example: 'Correct answer!' }
    }
  }
})
@ApiResponse({ status: 401, description: 'Unauthorized - Invalid team token' })
@ApiResponse({ status: 404, description: 'Session or question not found' })
@ApiResponse({ status: 409, description: 'Answer already submitted for this question' })
@UseGuards(TeamJwtGuard)
@Post()
submit(@Body() body: SubmitAnswerDto, @Req() req: any) {
  console.log('Answer submission request:', body);
  console.log('Team user from token:', req.user);
  
  // TeamJwtGuard'dan teamId'yi al
  const teamId = req.user?.teamId || req.user?.sub?.replace('team:', '');
  
  if (!teamId) {
    throw new Error('Team ID not found in token');
  }
  
  return this.service.submit(body, teamId);
}
}