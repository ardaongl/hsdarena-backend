import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from './types/websocket.types';

@Injectable()
export class WebsocketService {
  private rooms: Map<string, Set<AuthenticatedSocket>> = new Map();

  addClientToRoom(roomId: string, client: AuthenticatedSocket): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    const room = this.rooms.get(roomId);
    if (room) {
      room.add(client);
      client.sessionCode = roomId;
    }
  }

  removeClientFromRoom(client: AuthenticatedSocket): void {
    if (client.sessionCode) {
      const room = this.rooms.get(client.sessionCode);
      if (room) {
        room.delete(client);
        if (room.size === 0) {
          this.rooms.delete(client.sessionCode);
        }
      }
      client.sessionCode = undefined;
    }
  }

  broadcastToRoom(roomId: string, event: string, data: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(client => client.emit(event, data));
    }
  }

  getRoomClients(roomId: string): Set<AuthenticatedSocket> {
    return this.rooms.get(roomId) || new Set();
  }

  isClientInRoom(roomId: string, clientId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return Array.from(room).some(client => client.id === clientId);
  }
}