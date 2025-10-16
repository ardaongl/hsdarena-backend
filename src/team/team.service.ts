import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
  ) {}

  async join(sessionCode: string, teamName: string) {
    
    const session = await this.prisma.quizSession.findUnique({ 
      where: { sessionCode: sessionCode },
    });

    if (!session) {
      throw new NotFoundException(`Session with code '${sessionCode}' not found.`);
    }
    
    
    const newTeam = await this.prisma.team.create({
      data: {
        name: teamName,
        sessionId: session.id,
      },
    });

    const teamToken = await this.auth.signTeamToken(newTeam.id, session.id);
    
    if (!teamToken) {
        throw new InternalServerErrorException('Could not generate team token.');
    }

    return {
      teamId: newTeam.id,
      teamToken: teamToken,
    };
  }
}