import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../types/websocket.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WebsocketAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: AuthenticatedSocket = context.switchToWs().getClient();
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Authentication token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        // JWT secret'ını config'den almak en iyisidir, ama basitlik için burada bırakılabilir.
        // secret: this.configService.get('JWT_SECRET')
      });
      client.teamId = payload.teamId;
      return true;
    } catch (err) {
      throw new WsException('Invalid authentication token');
    }
  }
}