import { AuthGuard } from '@nestjs/passport';
export class TeamJwtGuard extends AuthGuard('team-jwt') {}