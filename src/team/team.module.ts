import { PrismaModule } from '../infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TeamController } from './team.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtTeamSecret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TeamController],
})
export class TeamModule {}