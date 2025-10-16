import {
  Body,
  Controller,
  Post,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { IsNotEmpty, IsString } from 'class-validator';
import { TeamService } from './team.service';

class TeamJoinDto {
  @IsString()
  @IsNotEmpty()
  sessionCode: string;

  @IsString()
  @IsNotEmpty()
  teamName: string;
}

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private readonly teamService: TeamService,
  ) {}

  @Post('join')
  @ApiOperation({ summary: 'Join session as a team' })
  @ApiBody({ type: TeamJoinDto })
  async joinSession(@Body() dto: TeamJoinDto) {
    const session = await this.prisma.quizSession.findUnique({
      where: { sessionCode: dto.sessionCode },
    });

    if (!session) {
      throw new NotFoundException(
        `Session with code "${dto.sessionCode}" not found.`,
      );
    }

    let team;
    try {
      team = await this.prisma.team.create({
        data: {
          name: dto.teamName,
          sessionId: session.id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A team with name "${dto.teamName}" has already joined this session.`,
          );
        }
      }
      // For other errors, throw a generic server error
      throw new InternalServerErrorException('Could not create or join the team.');
    }

    if (!team) {
      throw new InternalServerErrorException('Failed to create team, team object is null.');
    }

    const teamToken = this.jwtService.sign({
      teamId: team.id,
      teamName: team.name,
      sessionId: session.id,
      type: 'team',
    });

    return { teamId: team.id, teamToken };
    return this.teamService.joinSession(dto.sessionCode, dto.teamName);
  }
}