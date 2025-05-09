import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { MessageService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageDocument } from './schema/message.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

  afterInit() {
    this.logger.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.logger.log(`Client connected: ${payload.sub}`);
      } catch {
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
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateMessageDto,
  ): Promise<MessageDocument> {
    const senderId = client.data.user?.sub;
    if (!senderId) {
      throw new Error('User not authenticated');
    }

    const message = await this.messageService.sendMessage(
      senderId,
      payload.receiverId,
      payload.content,
    );

    // Émet le message à tous les clients dans la même conversation
    this.server.to(payload.conversationId).emit('newMessage', message);

    // Émet les notifications de mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach((userId) => {
        this.server.to(userId.toString()).emit('mentionNotification', {
          messageId: message._id,
          senderId: message.sender,
          content: message.content,
          conversationId: message.conversation,
        });
      });
    }

    return message;
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
    this.logger.log(`Client joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId);
    this.logger.log(`Client left conversation: ${conversationId}`);
  }
}
