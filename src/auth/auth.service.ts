import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';


@Injectable()
export class AuthService {
constructor(private prisma: PrismaService, private jwt: JwtService) {}


async login(email: string, password: string) {
const user = await this.prisma.user.findUnique({ where: { email } });
if (!user) throw new UnauthorizedException('Invalid credentials');
const ok = await argon.verify(user.passwordHash, password);
if (!ok) throw new UnauthorizedException('Invalid credentials');


const payload = { sub: user.id, role: 'admin', email: user.email };
const accessToken = await this.jwt.signAsync(payload, {
secret: process.env.JWT_ADMIN_SECRET,
expiresIn: process.env.JWT_EXP_ADMIN || '15m',
algorithm: 'HS256'
});
return { accessToken };
}


async signTeamToken(teamId: string, sessionId: string) {
const payload = { sub: `team:${teamId}`, role: 'team', teamId, sessionId };
return this.jwt.signAsync(payload, {
secret: process.env.JWT_TEAM_SECRET,
expiresIn: process.env.JWT_EXP_TEAM || '60m',
algorithm: 'HS256'
});
}
}