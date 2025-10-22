import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TeamJwtStrategy extends PassportStrategy(Strategy, 'team-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtTeamSecret'),
      algorithms: ['HS256'],
      jsonWebTokenOptions: { 
        clockTolerance: 5 // 5 saniye tolerans
      },
    });
}
async validate(payload: any) { 
  return payload; 
}
}