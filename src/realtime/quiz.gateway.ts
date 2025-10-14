import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';


@WebSocketGateway({ namespace: '/ws', cors: { origin: /localhost/ } })
export class QuizGateway {
@WebSocketServer() server: Server;


broadcastQuestionStart(sessionCode: string, payload: any) {
this.server.to(`quiz:${sessionCode}`).emit('question_start', payload);
}


// ileride: connection hook, oda join, score_update yayınları
}