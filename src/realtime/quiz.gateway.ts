import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { WebsocketAuthGuard } from './guards/websocket-auth.guard';
import { WsThrottlerGuard } from './guards/ws-throttler.guard';
import { WsLoggingInterceptor } from './interceptors/ws-logging.interceptor';
import { WebsocketService } from './websocket.service';
import { AuthenticatedSocket, JoinSessionPayload, QuestionStartEvent, ScoreUpdateEvent, QuizEndEvent } from './types/websocket.types';
import { JwtService } from '@nestjs/jwt';
import { QuestionDto, LeaderboardEntryDto, QuizResultsDto } from './dto/quiz-events.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  namespace: '/realtime',
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QuizGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {}

  @UseGuards(WebsocketAuthGuard, WsThrottlerGuard)
  @UseInterceptors(WsLoggingInterceptor)
  @SubscribeMessage('join_session')
  async handleJoinSession(client: AuthenticatedSocket, payload: JoinSessionPayload) {
    try {
      // Verify session code
      if (!payload.sessionCode) {
        throw new WsException('Session code is required');
      }

      // Add client to room
      this.websocketService.addClientToRoom(payload.sessionCode, client);

      // Send confirmation to client
      client.emit('join_success', {
        sessionCode: payload.sessionCode,
      });
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to join session',
      });
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.websocketService.removeClientFromRoom(client);
  }

  broadcastQuestionStart(sessionCode: string, question: QuestionDto, timeLimit: number) {
    try {
      const event: QuestionStartEvent = {
        event: 'question_start',
        data: {
          id: question.id,
          text: question.text,
          type: question.type,
          choices: question.choices,
          timeLimit: timeLimit,
          points: question.points,
        },
      };

      this.websocketService.broadcastToRoom(sessionCode, event.event, event.data);
      this.logger.debug(`Question started for session ${sessionCode}: ${question.id}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast question start: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        error instanceof Error ? error.stack : undefined);
      throw new WsException('Failed to broadcast question');
    }
  }

  broadcastScoreUpdate(sessionCode: string, leaderboard: any[], questionId: string) {
    const event: ScoreUpdateEvent = {
      event: 'score_update',
      data: {
        leaderboard: leaderboard.map((team) => ({
          teamName: team.name || 'Unknown Team',
          score: team.score,
          rank: team.rank,
        })),
        questionId: questionId,
      },
    };
    this.websocketService.broadcastToRoom(sessionCode, event.event, event.data);
  }

  broadcastQuizEnd(sessionCode: string, finalResults: any) {
    const event: QuizEndEvent = {
      event: 'quiz_end',
      data: {
        finalLeaderboard: finalResults.leaderboard.map((team: any, index: number) => ({
          teamName: team.name,
          score: team.score,
          rank: index + 1,
        })),
        totalQuestions: finalResults.totalQuestions,
        sessionDuration: finalResults.duration,
      },
    };
    this.websocketService.broadcastToRoom(sessionCode, event.event, event.data);
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(client: AuthenticatedSocket, payload: { questionId: string; answerId: string }) {
    const { questionId, answerId } = payload;
    
    if (!client.sessionCode || !client.teamId) {
      client.emit('error', { message: 'Not authenticated or not in a session' });
      return;
    }

    // Here you would typically:
    // 1. Validate the answer
    // 2. Update scores
    // 3. Broadcast score updates
    
    this.websocketService.broadcastToRoom(client.sessionCode, 'answer_received', {
      teamId: client.teamId,
      questionId,
      answerId
    });
  }

  private extractToken(client: AuthenticatedSocket): string | undefined {
    return client.handshake.auth.token || 
           client.handshake.headers.authorization?.replace('Bearer ', '');
  }
}