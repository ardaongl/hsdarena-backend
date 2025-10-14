import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class TeamService {
constructor(private prisma: PrismaService, private auth: AuthService) {}


async join(sessionCode: string, teamName: string) {
const session = await this.prisma.quizSession.findUnique({ where: { sessionCode } });
if (!session) throw new NotFoundException('Session not found');


const team = await this.prisma.team.create({ data: { sessionId: session.id, name: teamName } });
const teamToken = await this.auth.signTeamToken(team.id, session.id);
return { teamId: team.id, teamToken };
}
}