import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedSocket } from '../types/websocket.types';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WsLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const now = Date.now();
    const { event } = context.switchToWs().getData();
    
    this.logger.log(`WS Request started: ${event} from client ${client.id}`);
    
    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `WS Request ${event} from client ${client.id} completed in ${Date.now() - now}ms`
          );
        },
        error: (error) => {
          this.logger.error(
            `WS Request ${event} from client ${client.id} failed in ${Date.now() - now}ms`,
            error.stack
          );
        },
      })
    );
  }
}