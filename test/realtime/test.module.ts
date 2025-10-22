import { Module } from '@nestjs/common';
import { QuizGateway } from '../../src/realtime/quiz.gateway';
import { WebsocketService } from '../../src/realtime/websocket.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../src/infra/redis/redis.module';
import { RedisService } from '../../src/infra/redis/redis.service';
import configuration from '../../src/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        database: {
          url: 'mock://test-db',
        },
        redis: {
          host: 'localhost',
          port: 6379,
        },
        jwt: {
          secret: 'test-secret',
        },
      })],
    }),
  ],
  providers: [
    QuizGateway,
    WebsocketService,
    {
      provide: RedisService,
      useValue: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue(JSON.stringify({
          sessionCode: 'TEST123',
          teamId: 'test-team',
        })),
        del: jest.fn().mockResolvedValue(true),
        sadd: jest.fn().mockResolvedValue(1),
        srem: jest.fn().mockResolvedValue(1),
        smembers: jest.fn().mockResolvedValue(['test-socket-id']),
        exists: jest.fn().mockResolvedValue(1),
      }
    },
    {
      provide: JwtService,
      useValue: {
        sign: () => 'test-token',
        verify: jest.fn().mockResolvedValue({ teamId: 'test-team' }),
        verifyAsync: jest.fn().mockResolvedValue({ teamId: 'test-team' }),
        decode: jest.fn().mockReturnValue({ teamId: 'test-team' }),
      }
    },
    {
      provide: 'PrismaService',
      useValue: {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        session: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'test-session',
            code: 'TEST123',
            status: 'ACTIVE',
          }),
        },
        team: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'test-team',
            name: 'Test Team',
          }),
        },
      }
    }
  ]
})
export class TestModule {}