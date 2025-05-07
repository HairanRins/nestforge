import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';

import { Logger } from '@nestjs/common';
import { MessageService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.logger.log(`Client connected: ${payload.sub}`);
      } catch (err) {
        this.logger.warn('Invalid token, disconnecting client');
        client.disconnect();
      }
    } else {
      this.logger.warn('No token provided, disconnecting client');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    const senderId = client.data.user?.sub;
    if (!senderId) return;

    const message = await this.messageService.sendMessage(
      senderId,
      payload.receiverId,
      payload.content,
    );
    

    // Émet le message à tous les clients dans la même conversation
    this.server.to(payload.conversationId).emit('newMessage', message);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    this.logger.log(`Client joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(conversationId);
    this.logger.log(`Client left conversation: ${conversationId}`);
  }
}
