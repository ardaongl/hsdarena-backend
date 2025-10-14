import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { TeamService } from './team.service';

interface JoinTeamDto {
  sessionCode: string;
  teamName: string;
}

@ApiTags('team')
@Controller('team')
export class TeamController {
constructor(private readonly service: TeamService) {}

@ApiBody({
  description: 'Team join request',
  schema: {
    type: 'object',
    properties: {
      sessionCode: { type: 'string', example: 'ABC123' },
      teamName: { type: 'string', example: 'Red Dragons' }
    },
    required: ['sessionCode', 'teamName']
  }
})
@Post('join')
join(@Body() body: JoinTeamDto) {
  console.log('Team join request body:', body);
  return this.service.join(body.sessionCode, body.teamName);
}
}