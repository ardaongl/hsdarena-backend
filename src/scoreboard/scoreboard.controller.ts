import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ScoreboardService } from './scoreboard.service';

@ApiTags('scoreboard')
@Controller('scoreboard')
export class ScoreboardController {
  constructor(private readonly scoreboardService: ScoreboardService) {}

  @Get(':sessionCode')
  @ApiOperation({
    summary: 'Get scoreboard for a session',
    description: 'Retrieve the leaderboard for a specific quiz session by session code. Public endpoint.',
  })
  @ApiParam({
    name: 'sessionCode',
    description: 'Session code to get scoreboard for',
    example: 'ABC123',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Scoreboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessionCode: { type: 'string', example: 'ABC123' },
        leaderboard: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              teamName: { type: 'string', example: 'Red Dragons' },
              score: { type: 'number', example: 150 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Session not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getScoreboard(@Param('sessionCode') sessionCode: string) {
    const result = await this.scoreboardService.getScoreboard(sessionCode);
    if (!result) {
      throw new NotFoundException(`Session with code "${sessionCode}" not found.`);
    }
    return result;
  }
}

