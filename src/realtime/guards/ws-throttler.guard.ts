import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../types/websocket.types';

@Injectable()
export class WsThrottlerGuard implements CanActivate {
  private readonly requestMap = new Map<string, number[]>();
  private readonly ttl = 60000; // 1 minute window
  private readonly limit = 100;  // 100 requests per minute

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const now = Date.now();
    
    if (!this.requestMap.has(client.id)) {
      this.requestMap.set(client.id, [now]);
      return true;
    }

    const requestTimestamps = this.requestMap.get(client.id) || [];
    const windowStart = now - this.ttl;
    
    // Remove old timestamps
    const recentRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.limit) {
      throw new WsException('Too many requests');
    }
    
    recentRequests.push(now);
    this.requestMap.set(client.id, recentRequests);
    
    return true;
  }
}