import { Test, TestingModule } from '@nestjs/testing';
import { QuizGateway } from '../quiz.gateway';
import { WebsocketService } from '../websocket.service';
import { AuthenticatedSocket } from '../types/websocket.types';
import { createMock } from '@golevelup/ts-jest';
import { WsException } from '@nestjs/websockets';

describe('QuizGateway', () => {
  let gateway: QuizGateway;
  let websocketService: WebsocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizGateway,
        {
          provide: WebsocketService,
          useValue: {
            addClientToRoom: jest.fn(),
            removeClientFromRoom: jest.fn(),
            broadcastToRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<QuizGateway>(QuizGateway);
    websocketService = module.get<WebsocketService>(WebsocketService);
  });

  it('should handle connection', async () => {
    const mockClient = createMock<AuthenticatedSocket>();
    await gateway.handleConnection(mockClient);
    expect(mockClient.id).toBeDefined();
  });

  it('should handle join session', async () => {
    const mockClient = createMock<AuthenticatedSocket>();
    const payload = { sessionCode: 'TEST123', teamToken: 'token123' };

    await gateway.handleJoinSession(mockClient, payload);

    expect(websocketService.addClientToRoom).toHaveBeenCalledWith(
      payload.sessionCode,
      mockClient,
    );
  });

  it('should handle submit answer', async () => {
    const mockClient = createMock<AuthenticatedSocket>({
      sessionCode: 'TEST123',
      teamId: 'team123',
    });
    const payload = { questionId: 'q1', answerId: 'a1' };

    await gateway.handleSubmitAnswer(mockClient, payload);

    expect(websocketService.broadcastToRoom).toHaveBeenCalledWith(
      'TEST123',
      'answer_received',
      expect.any(Object),
    );
  });

  describe('Oturum Testleri', () => {
    it('geçersiz oturum kodu ile katılmayı reddetmeli', async () => {
      const mockClient = createMock<AuthenticatedSocket>();
      const payload = { sessionCode: '', teamToken: 'token123' };

      try {
        await gateway.handleJoinSession(mockClient, payload);
        fail('Hata fırlatılmalıydı');
      } catch (error) {
        expect(error).toBeInstanceOf(WsException);
      }
    });

    it('oturumdan ayrılma işlemini doğru yapmalı', () => {
      const mockClient = createMock<AuthenticatedSocket>({
        sessionCode: 'TEST123',
        teamId: 'team123',
      });

      gateway.handleDisconnect(mockClient);
      expect(websocketService.removeClientFromRoom).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('Cevap Gönderme Testleri', () => {
    it('oturumda olmayan kullanıcının cevabını reddetmeli', async () => {
      const mockClient = createMock<AuthenticatedSocket>({
        sessionCode: undefined,
        teamId: 'team123',
      });
      
      const payload = { questionId: 'q1', answerId: 'a1' };
      await gateway.handleSubmitAnswer(mockClient, payload);
      
      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Not authenticated or not in a session'
      });
    });

    it('geçerli cevabı kabul etmeli ve puanları güncellemeli', async () => {
      const mockClient = createMock<AuthenticatedSocket>({
        sessionCode: 'TEST123',
        teamId: 'team123',
      });
      
      const payload = { 
        questionId: 'q1', 
        answerId: 'a1',
        points: 10
      };
      
      await gateway.handleSubmitAnswer(mockClient, payload);
      
      expect(websocketService.broadcastToRoom).toHaveBeenCalledWith(
        'TEST123',
        'answer_received',
        expect.objectContaining({
          teamId: 'team123',
          questionId: 'q1'
        })
      );
    });
  });

  describe('Bağlantı Yönetimi', () => {
    it('bağlantı koptuğunda kaynakları temizlemeli', async () => {
      const mockClient = createMock<AuthenticatedSocket>({
        sessionCode: 'TEST123',
        teamId: 'team123',
      });

      await gateway.handleDisconnect(mockClient);
      
      expect(websocketService.removeClientFromRoom).toHaveBeenCalled();
      expect(mockClient.sessionCode).toBeUndefined();
    });
  });
});
