import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ConversationService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

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
            type: 'string'
          },
          example: ['681a0b055cb51fbdd728520f', '681a0c089906df218996667b'],
          description: 'Liste des IDs des participants à la conversation'
        }
      }
    },
    examples: {
      example1: {
        value: {
          participantIds: ['681a0b055cb51fbdd728520f', '681a0c089906df218996667b']
        },
        summary: 'Créer une conversation entre deux utilisateurs'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation créée avec succès',
    schema: {
      example: {
        id: '681a0d089906df218996667c',
        participants: [
          {
            id: '681a0b055cb51fbdd728520f',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          {
            id: '681a0c089906df218996667b',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          }
        ],
        messages: [
          {
            id: '681a0e089906df218996667d',
            content: 'Bonjour !',
            sender: '681a0b055cb51fbdd728520f',
            createdAt: '2024-05-06T12:00:00.000Z'
          },
          {
            id: '681a0f089906df218996667e',
            content: 'Salut ! Comment vas-tu ?',
            sender: '681a0c089906df218996667b',
            createdAt: '2024-05-06T12:01:00.000Z'
          }
        ],
        createdAt: '2024-05-06T12:00:00.000Z',
        updatedAt: '2024-05-06T12:01:00.000Z'
      }
    }
  })
  async createConversation(@Request() req, @Body() body: { participantIds: string[] }) {
    const allParticipants = [...body.participantIds, req.user.userId];
    return this.conversationService.create(allParticipants);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les conversations de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des conversations',
    schema: {
      example: [{
        id: '681a0d089906df218996667c',
        participants: [
          {
            id: '681a0b055cb51fbdd728520f',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          {
            id: '681a0c089906df218996667b',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          }
        ],
        lastMessage: {
          id: '681a0f089906df218996667e',
          content: 'Salut ! Comment vas-tu ?',
          sender: '681a0c089906df218996667b',
          createdAt: '2024-05-06T12:01:00.000Z'
        },
        createdAt: '2024-05-06T12:00:00.000Z',
        updatedAt: '2024-05-06T12:01:00.000Z'
      }]
    }
  })
  async getUserConversations(@Request() req) {
    return this.conversationService.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une conversation spécifique' })
  @ApiResponse({
    status: 200,
    description: 'Détails de la conversation',
    schema: {
      example: {
        id: '681a0d089906df218996667c',
        participants: [
          {
            id: '681a0b055cb51fbdd728520f',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          {
            id: '681a0c089906df218996667b',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          }
        ],
        messages: [
          {
            id: '681a0e089906df218996667d',
            content: 'Bonjour !',
            sender: '681a0b055cb51fbdd728520f',
            createdAt: '2024-05-06T12:00:00.000Z'
          },
          {
            id: '681a0f089906df218996667e',
            content: 'Salut ! Comment vas-tu ?',
            sender: '681a0c089906df218996667b',
            createdAt: '2024-05-06T12:01:00.000Z'
          }
        ],
        createdAt: '2024-05-06T12:00:00.000Z',
        updatedAt: '2024-05-06T12:01:00.000Z'
      }
    }
  })
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.conversationService.findById(id);
  }
}
