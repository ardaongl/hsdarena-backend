import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamService } from './team.service';



class JoinTeamDto {
  sessionCode: string;
  teamName: string;
}

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @ApiOperation({
    summary: 'Join a quiz session as a team',
    description: 'Creates a new team for a given session code and returns a team-specific JWT token.'
  })
  @ApiBody({
    description: 'Team join request containing session code and team name.',
    schema: {
      type: 'object',
      properties: {
        sessionCode: { type: 'string', example: 'ABC123' },
        teamName: { type: 'string', example: 'Red Dragons' }
      },
      required: ['sessionCode', 'teamName']
    }
  })
  @ApiResponse({ status: 201, description: 'Team joined successfully. Returns teamId and token.'})
  @ApiResponse({ status: 404, description: 'Session with the given code was not found.'})
  @Post('join')
  join(@Body() body: JoinTeamDto) {
    return this.service.join(body.sessionCode, body.teamName);
  }
}