import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { TeamJwtStrategy } from './strategies/team-jwt.strategy';


@Module({
imports: [JwtModule.register({})],
controllers: [AuthController],
providers: [AuthService, AdminJwtStrategy, TeamJwtStrategy],
exports: [AuthService]
})
export class AuthModule {}