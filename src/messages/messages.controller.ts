import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  Patch,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau message' })
  @ApiResponse({ status: 201, description: 'Message créé avec succès' })
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messageService.create(createMessageDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les messages de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Liste des messages' })
  getMessages(@Request() req) {
    return this.messageService.getMessages(req.user.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: "Compter les messages non lus de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus' })
  getUnreadMessagesCount(@Request() req) {
    return this.messageService.getUnreadMessagesCount(req.user.userId);
  }

  @Get('conversations')
  @ApiOperation({
    summary: "Récupérer toutes les conversations de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des conversations avec leur dernier message',
  })
  async getUserConversations(@Request() req) {
    return this.messageService.getUserConversations(req.user.userId);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: "Récupérer tous les messages d'une conversation" })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages dans la conversation',
  })
  async getConversationMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messageService.getConversationMessages(
      conversationId,
      req.user.userId,
    );
  }

  @Patch('conversations/:conversationId/read')
  @ApiOperation({
    summary: "Marquer tous les messages d'une conversation comme lus",
  })
  @ApiResponse({ status: 200, description: 'Messages marqués comme lus' })
  async markMessagesAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messageService.markMessagesAsRead(
      conversationId,
      req.user.userId,
    );
  }

  @Get('with/:receiverId')
  @ApiOperation({
    summary: 'Récupérer les messages avec un utilisateur spécifique',
  })
  @ApiResponse({
    status: 200,
    description: "Messages avec l'utilisateur spécifié et informations de conversation",
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'ID de la conversation' },
        isNewConversation: { type: 'boolean', description: 'Si la conversation vient d\'être créée' },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              sender: { type: 'object' },
              receiver: { type: 'object' },
              conversationId: { type: 'string' },
              read: { type: 'boolean' },
              parentMessage: { type: 'object', nullable: true },
              isReply: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getMessagesByReceiver(
    @Request() req,
    @Param('receiverId') receiverId: string,
  ) {
    return this.messageService.getMessagesByReceiver(
      req.user.userId,
      receiverId,
    );
  }

  @Post('with/:receiverId/reply')
  @ApiOperation({ summary: 'Répondre au dernier message d\'une conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Ceci est une réponse',
          description: 'Contenu de la réponse',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Réponse créée avec succès' })
  async replyToLastMessageInConversation(
    @Request() req,
    @Param('receiverId') receiverId: string,
    @Body() replyDto: ReplyMessageDto,
  ) {
    return this.messageService.replyToLastMessageInConversation(
      receiverId,
      req.user.userId,
      replyDto.content,
    );
  }

  @Post('notes')
  @ApiOperation({ summary: 'Créer une nouvelle note personnelle' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Ceci est une note personnelle',
          description: 'Contenu de la note',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Note créée avec succès' })
  async createNote(@Request() req, @Body() createNoteDto: ReplyMessageDto) {
    return this.messageService.replyToLastMessageInConversation(
      req.user.userId, // receiverId = senderId pour une note personnelle
      req.user.userId,
      createNoteDto.content,
    );
  }

  @Get('notes')
  @ApiOperation({ summary: 'Récupérer toutes les notes personnelles' })
  @ApiResponse({ status: 200, description: 'Liste des notes personnelles' })
  async getNotes(@Request() req) {
    return this.messageService.getUserConversations(req.user.userId, true);
  }

  @Post(':messageId/reply')
  @ApiOperation({ summary: 'Répondre à un message spécifique' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Ceci est une réponse',
          description: 'Contenu de la réponse',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Réponse créée avec succès' })
  async replyToMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() replyDto: ReplyMessageDto,
  ) {
    return this.messageService.replyToMessage(
      messageId,
      req.user.userId,
      replyDto.content,
    );
  }

  @Patch(':messageId/read')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @ApiResponse({ status: 200, description: 'Message marqué comme lu' })
  async markMessageAsRead(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    return this.messageService.markMessageAsRead(messageId, req.user.userId);
  }

  @Post('conversations/:conversationId/users/:userId')
  @ApiOperation({ summary: 'Ajouter un utilisateur à une conversation' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur ajouté à la conversation',
  })
  async addUserToConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
  ) {
    return this.messageService.addUserToConversation(
      conversationId,
      req.user.userId,
      userId,
    );
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Supprimer un message' })
  @ApiResponse({ status: 200, description: 'Message supprimé' })
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.messageService.deleteMessage(messageId, req.user.userId);
  }

  @Delete('conversations/:conversationId/users/:userId')
  @ApiOperation({ summary: "Retirer un utilisateur d'une conversation" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur retiré de la conversation',
  })
  async removeUserFromConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
  ) {
    return this.messageService.removeUserFromConversation(
      conversationId,
      req.user.userId,
      userId,
    );
  }

  // Nouvel endpoint pour récupérer tous les messages de l'utilisateur avec détails
  @Get('all-messages-with-details')
  @ApiOperation({
    summary:
      "Récupérer tous les messages de l'utilisateur connecté avec détails des conversations",
  })
  @ApiResponse({
    status: 200,
    description:
      'Liste complète des messages organisés par conversation avec détails',
  })
  async getAllMessagesWithDetails(@Request() req) {
    return this.messageService.getAllMessagesWithDetails(req.user.userId);
  }
}
