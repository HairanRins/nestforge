import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ConversationService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        participantIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['681a0b055cb51fbdd728520f', '681a0c089906df218996667b'],
          description: 'Liste des IDs des participants à la conversation',
        },
      },
    },
    examples: {
      example1: {
        value: {
          participantIds: [
            '681a0b055cb51fbdd728520f',
            '681a0c089906df218996667b',
          ],
        },
        summary: 'Créer une conversation entre deux utilisateurs',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation créée avec succès',
  })
  async createConversation(
    @Request() req,
    @Body() body: { participantIds: string[] },
  ) {
    const allParticipants = [...body.participantIds, req.user.userId].flat();
    return this.conversationService.create(allParticipants);
  }

  @Get()
  @ApiOperation({
    summary: "Récupérer toutes les conversations de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des conversations de l'utilisateur",
  })
  async getUserConversations(@Request() req) {
    return this.conversationService.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une conversation spécifique' })
  @ApiResponse({
    status: 200,
    description: 'Détails de la conversation',
  })
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.conversationService.findById(id);
  }

  @Post(':id/mark-as-read')
  @ApiOperation({ summary: 'Marquer tous les messages d\'une conversation comme lus' })
  @ApiResponse({
    status: 200,
    description: 'Messages marqués comme lus avec succès',
  })
  async markConversationAsRead(
    @Request() req,
    @Param('id') conversationId: string,
  ) {
    return this.conversationService.markMessagesAsRead(conversationId, req.user.userId);
  }
}
