import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class TeamJwtStrategy extends PassportStrategy(Strategy, 'team-jwt') {
constructor() {
super({
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
ignoreExpiration: false,
secretOrKey: process.env.JWT_TEAM_SECRET,
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