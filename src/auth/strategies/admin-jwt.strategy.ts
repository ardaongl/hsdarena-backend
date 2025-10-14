import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
constructor() {
super({
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
ignoreExpiration: false,
secretOrKey: process.env.JWT_ADMIN_SECRET,
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