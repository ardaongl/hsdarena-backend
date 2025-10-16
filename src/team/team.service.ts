import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async joinSession(sessionCode: string, teamName: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { sessionCode: sessionCode },
    });

    if (!session) {
      throw new NotFoundException(
        `Session with code "${sessionCode}" not found.`,
      );
    }

    try {
      const team = await this.prisma.team.create({
        data: {
          name: teamName,
          sessionId: session.id,
        },
      });

      const teamToken = await this.authService.signTeamToken(team.id, session.id);

      return { teamId: team.id, teamToken };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`A team with name "${teamName}" has already joined this session.`);
      }
      throw new InternalServerErrorException('Could not create or join the team.');
    }
  }
}
