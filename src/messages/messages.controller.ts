import { Controller, Post, Body, UseGuards, Request, Get, Param, Put, Logger, Delete } from '@nestjs/common';
import { MessageService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message à un utilisateur spécifique dans une conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          example: '681a0d089906df218996667c',
          description: 'ID de la conversation'
        },
        receiverId: {
          type: 'string',
          example: '681a0c089906df218996667b',
          description: 'ID du destinataire du message'
        },
        content: {
          type: 'string',
          example: 'Bonjour ! Comment vas-tu ?',
          description: 'Contenu du message'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Message envoyé avec succès'
  })
  async createMessage(
    @Request() req,
    @Body() body: { conversationId: string; receiverId: string; content: string }
  ) {
    this.logger.debug(`User ID from request: ${req.user?.userId}`);
    this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    
    if (!req.user?.userId) {
      throw new Error('User ID not found in request');
    }

    return this.messageService.create({
      content: body.content,
      sender: req.user.userId,
      receiver: body.receiverId,
      conversation: body.conversationId
    });
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des conversations avec leur dernier message'
  })
  async getUserConversations(@Request() req) {
    return this.messageService.getUserConversations(req.user.userId);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Récupérer tous les messages d\'une conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversation',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages de la conversation'
  })
  async getConversationMessages(
    @Request() req,
    @Param('conversationId') conversationId: string
  ) {
    return this.messageService.getConversationMessages(conversationId, req.user.userId);
  }

  @Get('user/:receiverId')
  @ApiOperation({ summary: 'Récupérer tous les messages entre l\'utilisateur actuel et un autre utilisateur' })
  @ApiParam({
    name: 'receiverId',
    description: 'ID de l\'autre utilisateur',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages entre les deux utilisateurs'
  })
  async getMessagesWithUser(
    @Request() req,
    @Param('receiverId') receiverId: string
  ) {
    return this.messageService.getMessagesByReceiver(req.user.userId, receiverId);
  }

  @Put('conversation/:conversationId/read')
  @ApiOperation({ summary: 'Marquer tous les messages d\'une conversation comme lus' })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversation',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Messages marqués comme lus',
    schema: {
      example: {
        success: true,
        updatedCount: 2,
        totalMessages: 2,
        messages: [
          {
            id: '681a0e089906df218996667d',
            content: 'Bonjour !',
            sender: '681a0b055cb51fbdd728520f',
            receiver: '681a0c089906df218996667b',
            conversation: '681a0d089906df218996667c',
            read: true,
            createdAt: '2024-05-06T12:00:00.000Z'
          }
        ]
      }
    }
  })
  async markMessagesAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string
  ) {
    this.logger.debug(`Marking messages as read for user: ${req.user.userId} in conversation: ${conversationId}`);
    return this.messageService.markMessagesAsRead(conversationId, req.user.userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Récupérer le nombre de messages non lus' })
  @ApiResponse({
    status: 200,
    description: 'Nombre de messages non lus'
  })
  async getUnreadMessagesCount(@Request() req) {
    return this.messageService.getUnreadMessagesCount(req.user.userId);
  }

  @Put('message/:messageId/read')
  @ApiOperation({ summary: 'Marquer un message spécifique comme lu' })
  @ApiParam({
    name: 'messageId',
    description: 'ID du message à marquer comme lu',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Message marqué comme lu',
    schema: {
      example: {
        success: true,
        message: 'Message marked as read',
        updatedMessage: {
          id: '681a0e089906df218996667d',
          content: 'Bonjour !',
          sender: '681a0b055cb51fbdd728520f',
          receiver: '681a0c089906df218996667b',
          conversation: '681a0d089906df218996667c',
          read: true,
          createdAt: '2024-05-06T12:00:00.000Z'
        }
      }
    }
  })
  async markMessageAsRead(
    @Request() req,
    @Param('messageId') messageId: string
  ) {
    this.logger.debug(`Marking message ${messageId} as read for user: ${req.user.userId}`);
    return this.messageService.markMessageAsRead(messageId, req.user.userId);
  }

  @Post('conversation/:conversationId/add-user')
  @ApiOperation({ summary: 'Ajouter un utilisateur à une conversation existante' })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversation',
    type: 'string'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: '681a0c089906df218996667b',
          description: 'ID de l\'utilisateur à ajouter'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur ajouté à la conversation',
    schema: {
      example: {
        success: true,
        message: 'User added to conversation successfully',
        conversation: {
          id: '681a0d089906df218996667c',
          participants: [
            '681a0b055cb51fbdd728520f',
            '681a0c089906df218996667b',
            '681a0d089906df218996667d'
          ],
          updatedAt: '2024-05-06T12:00:00.000Z'
        }
      }
    }
  })
  async addUserToConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string }
  ) {
    this.logger.debug(`Adding user ${body.userId} to conversation ${conversationId} by user ${req.user.userId}`);
    return this.messageService.addUserToConversation(conversationId, req.user.userId, body.userId);
  }

  @Delete('message/:messageId')
  @ApiOperation({ summary: 'Supprimer un message' })
  @ApiParam({
    name: 'messageId',
    description: 'ID du message à supprimer',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Message supprimé avec succès',
    schema: {
      example: {
        success: true,
        message: 'Message deleted successfully',
        deletedMessage: {
          id: '681a0e089906df218996667d',
          content: 'Bonjour !',
          sender: '681a0b055cb51fbdd728520f',
          receiver: '681a0c089906df218996667b',
          conversation: '681a0d089906df218996667c',
          createdAt: '2024-05-06T12:00:00.000Z'
        }
      }
    }
  })
  async deleteMessage(
    @Request() req,
    @Param('messageId') messageId: string
  ) {
    this.logger.debug(`Deleting message ${messageId} by user ${req.user.userId}`);
    return this.messageService.deleteMessage(messageId, req.user.userId);
  }

  @Delete('conversation/:conversationId/remove-user')
  @ApiOperation({ summary: 'Supprimer un participant d\'une conversation' })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversation',
    type: 'string'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: '681a0c089906df218996667b',
          description: 'ID de l\'utilisateur à supprimer'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Participant supprimé de la conversation',
    schema: {
      example: {
        success: true,
        message: 'User removed from conversation successfully',
        conversation: {
          id: '681a0d089906df218996667c',
          participants: [
            '681a0b055cb51fbdd728520f',
            '681a0c089906df218996667b'
          ],
          updatedAt: '2024-05-06T12:00:00.000Z'
        }
      }
    }
  })
  async removeUserFromConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string }
  ) {
    this.logger.debug(`Removing user ${body.userId} from conversation ${conversationId} by user ${req.user.userId}`);
    return this.messageService.removeUserFromConversation(conversationId, req.user.userId, body.userId);
  }
} 