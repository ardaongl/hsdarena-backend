import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketService } from '../websocket.service';
import { AuthenticatedSocket } from '../types/websocket.types';
import { createMock } from '@golevelup/ts-jest';

describe('WebsocketService', () => {
  let service: WebsocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsocketService],
    }).compile();

    service = module.get<WebsocketService>(WebsocketService);
  });

  it('should add client to room', () => {
    const mockClient = createMock<AuthenticatedSocket>();
    const sessionCode = 'TEST123';

    service.addClientToRoom(sessionCode, mockClient);
    
    const clients = service.getRoomClients(sessionCode);
    expect(clients.has(mockClient)).toBeTruthy();
    expect(mockClient.sessionCode).toBe(sessionCode);
  });

  it('should remove client from room', () => {
    const mockClient = createMock<AuthenticatedSocket>();
    const sessionCode = 'TEST123';

    service.addClientToRoom(sessionCode, mockClient);
    service.removeClientFromRoom(mockClient);
    
    const clients = service.getRoomClients(sessionCode);
    expect(clients.size).toBe(0);
  });

  it('should broadcast to room', () => {
    const mockClient = createMock<AuthenticatedSocket>({
      emit: jest.fn(),
    });
    const sessionCode = 'TEST123';
    const eventData = { message: 'test' };

    service.addClientToRoom(sessionCode, mockClient);
    service.broadcastToRoom(sessionCode, 'test_event', eventData);

    expect(mockClient.emit).toHaveBeenCalledWith('test_event', eventData);
  });

  it('should check if client is in room', () => {
    const mockClient = createMock<AuthenticatedSocket>({ id: 'client123' });
    const sessionCode = 'TEST123';

    service.addClientToRoom(sessionCode, mockClient);
    
    expect(service.isClientInRoom(sessionCode, 'client123')).toBeTruthy();
    expect(service.isClientInRoom(sessionCode, 'nonexistent')).toBeFalsy();
  });

  describe('Oda Yönetimi', () => {
    it('aynı odaya birden fazla kullanıcı ekleyebilmeli', () => {
      const mockClient1 = createMock<AuthenticatedSocket>({ id: 'client1' });
      const mockClient2 = createMock<AuthenticatedSocket>({ id: 'client2' });
      const sessionCode = 'TEST123';

      service.addClientToRoom(sessionCode, mockClient1);
      service.addClientToRoom(sessionCode, mockClient2);
      
      const clients = service.getRoomClients(sessionCode);
      expect(clients.size).toBe(2);
    });

    it('var olmayan odayı kontrol ettiğinde boş set döndürmeli', () => {
      const clients = service.getRoomClients('NONEXISTENT');
      expect(clients.size).toBe(0);
    });
  });

  describe('Yayın Testleri', () => {
    it('odadaki tüm kullanıcılara yayın yapabilmeli', () => {
      const mockClient1 = createMock<AuthenticatedSocket>({ 
        id: 'client1',
        emit: jest.fn()
      });
      const mockClient2 = createMock<AuthenticatedSocket>({
        id: 'client2',
        emit: jest.fn()
      });
      const sessionCode = 'TEST123';

      service.addClientToRoom(sessionCode, mockClient1);
      service.addClientToRoom(sessionCode, mockClient2);

      const testData = { message: 'test' };
      service.broadcastToRoom(sessionCode, 'test_event', testData);

      expect(mockClient1.emit).toHaveBeenCalledWith('test_event', testData);
      expect(mockClient2.emit).toHaveBeenCalledWith('test_event', testData);
    });
  });

  describe('Hata Durumları', () => {
    it('geçersiz oturum kodunda yayın yapmaya çalışınca sessizce geçmeli', () => {
      const testData = { message: 'test' };
      expect(() => {
        service.broadcastToRoom('INVALID', 'test_event', testData);
      }).not.toThrow();
    });
  });
});
