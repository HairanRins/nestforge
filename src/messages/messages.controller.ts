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
  Put,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

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

  @Put('conversations/:conversationId/read')
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
    description: "Messages avec l'utilisateur spécifié",
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

  @Put(':messageId/read')
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
