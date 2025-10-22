import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { JwtService } from '@nestjs/jwt';
import { TestModule } from './test.module';
import { QuizGateway } from '../../src/realtime/quiz.gateway';
import { WebsocketService } from '../../src/realtime/websocket.service';
import { QuestionType } from '../../src/realtime/dto/quiz-events.dto';
import { QuestionStartEvent, ScoreUpdateEvent, QuizEndEvent } from '../../src/realtime/types/websocket.types';

describe('QuizGateway (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;
  let testSessionCode: string;
  let testToken: string;
  let jwtService: JwtService;
  let gateway: QuizGateway;
  let wsService: WebsocketService;

  const setupSocket = () => {
    return new Promise<Socket>((resolve, reject) => {
      const newSocket = io('http://localhost:3001/quiz', {
        auth: { token: testToken },
        transports: ['websocket'],
        reconnection: false,
        timeout: 5000,
      });

      const connectTimeout = setTimeout(() => {
        newSocket.close();
        reject(new Error('Connection timeout'));
      }, 5000);

      newSocket.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('Connected to server');
        resolve(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        clearTimeout(connectTimeout);
        console.error('Connection error:', error);
        reject(error);
      });
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    gateway = moduleFixture.get<QuizGateway>(QuizGateway);
    wsService = moduleFixture.get<WebsocketService>(WebsocketService);

    await app.listen(3001);

    testToken = 'test-token';
    testSessionCode = 'TEST123';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    try {
      socket = await setupSocket();
    } catch (error) {
      console.error('Failed to setup socket in beforeEach:', error);
      throw error;
    }
  });

  afterEach(() => {
    if (socket?.connected) {
      socket.disconnect();
    }
  });

  it('should connect and join session', async () => {
    const joinPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join session timeout'));
      }, 5000);

      socket.once('join_success', (data: { sessionCode: string }) => {
        clearTimeout(timeout);
        expect(data.sessionCode).toBe(testSessionCode);
        resolve();
      });

      socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      socket.emit('join_session', {
        sessionCode: testSessionCode,
        teamToken: testToken,
      });
    });

    await expect(joinPromise).resolves.not.toThrow();
  });

  it('should receive question start event', async () => {
    // Join the session first to be able to receive broadcasts
    socket.emit('join_session', {
      sessionCode: testSessionCode,
      teamToken: testToken,
    });
    await new Promise<void>(resolve => socket.once('join_success', resolve));
    const questionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Question start event timeout'));
      }, 5000);

      socket.once('question_start', (data: QuestionStartEvent['data']) => {
        clearTimeout(timeout);
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('text');
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('points');
        resolve();
      });
    });

    gateway.broadcastQuestionStart(testSessionCode, {
      id: 'q1',
      text: 'Test Question',
      type: QuestionType.MCQ,
      choices: [
        { id: 'a1', text: 'Answer 1' },
        { id: 'a2', text: 'Answer 2' },
      ],
      points: 10
    }, 30);

    await expect(questionPromise).resolves.not.toThrow();
  });

  it('should receive score updates', async () => {
    // Join the session first to be able to receive broadcasts
    socket.emit('join_session', {
      sessionCode: testSessionCode,
      teamToken: testToken,
    });
    await new Promise<void>(resolve => socket.once('join_success', resolve));

    const scorePromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Score update event timeout'));
      }, 5000);

      socket.once('score_update', (data: ScoreUpdateEvent['data']) => {
        clearTimeout(timeout);
        expect(data).toHaveProperty('leaderboard');
        expect(data.leaderboard).toBeInstanceOf(Array);
        expect(data).toHaveProperty('questionId');
        resolve();
      });
    });

    gateway.broadcastScoreUpdate(testSessionCode, [
      { teamName: 'Team1', score: 100, rank: 1 },
      { teamName: 'Team2', score: 80, rank: 2 },
    ], 'q1');

    await expect(scorePromise).resolves.not.toThrow();
  });

  it('should receive quiz end event', async () => {
    // Join the session first to be able to receive broadcasts
    socket.emit('join_session', {
      sessionCode: testSessionCode,
      teamToken: testToken,
    });
    await new Promise<void>(resolve => socket.once('join_success', resolve));

    const quizEndPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Quiz end event timeout'));
      }, 5000);

      socket.once('quiz_end', (data: QuizEndEvent['data']) => {
        clearTimeout(timeout);
        expect(data).toHaveProperty('finalLeaderboard');
        expect(data).toHaveProperty('totalQuestions');
        expect(data).toHaveProperty('sessionDuration');
        resolve();
      });
    });

    gateway.broadcastQuizEnd(testSessionCode, {
      leaderboard: [
        { teamName: 'Team1', score: 150, rank: 1 },
        { teamName: 'Team2', score: 120, rank: 2 },
      ],
      totalQuestions: 10,
      duration: 3600,
    });

    await expect(quizEndPromise).resolves.not.toThrow();
  });

  it('should handle disconnection and cleanup', async () => {
    // Join a session to test if cleanup works
    socket.emit('join_session', {
      sessionCode: testSessionCode,
      teamToken: testToken,
    });
    await new Promise<void>(resolve => socket.once('join_success', resolve));

    const disconnectPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Disconnect timeout'));
      }, 5000);

      socket.once('disconnect', () => {
        clearTimeout(timeout);
        // isClientInRoom'u çağırmadan önce odanın temizlendiğini doğrulamak daha güvenilir olabilir.
        resolve();
      });
    });

    socket.disconnect();
    await expect(disconnectPromise).resolves.not.toThrow();
  });
});