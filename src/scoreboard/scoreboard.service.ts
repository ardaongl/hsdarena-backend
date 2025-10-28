import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';

@Injectable()
export class ScoreboardService {
  constructor(private prisma: PrismaService) {}

  async getScoreboard(sessionCode: string) {
    // First, get the session by code
    const session = await this.prisma.quizSession.findUnique({
      where: { sessionCode },
      include: {
        teams: {
          include: {
            answers: {
              select: {
                pointsAwarded: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Calculate total score for each team
    const leaderboard = session.teams
      .map((team) => {
        const totalScore = team.answers.reduce(
          (sum, answer) => sum + answer.pointsAwarded,
          0,
        );

        return {
          teamName: team.name,
          score: totalScore,
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return {
      sessionCode: session.sessionCode,
      leaderboard,
    };
  }
}

