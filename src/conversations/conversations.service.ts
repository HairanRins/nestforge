import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schema/conversation.schema';
import { Logger } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { Message, MessageDocument } from '../messages/schema/message.schema';

@Injectable()
export class ConversationService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private userService: UserService,
  ) {
    this.logger = new Logger(ConversationService.name);
  }

  async create(participantIds: string[]) {
    const conversation = new this.conversationModel({
      participants: participantIds.map((id) => new Types.ObjectId(id)),
    });
    return conversation.save();
  }

  async findByUserId(userId: string) {
    const conversations = await this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'firstName lastName email')
      .populate('messages')
      .sort({ updatedAt: -1 })
      .exec();

    return conversations;
  }

  async findById(id: string) {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participants', 'firstName lastName email')
      .populate('messages')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    // Définir les types pour les participants
    interface Participant {
      _id: Types.ObjectId;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
      online?: boolean;
      lastSeen?: Date;
    }

    interface ConversationWithParticipants {
      _id: Types.ObjectId;
      participants: Participant[];
      title?: string;
      updatedAt: Date;
      createdAt: Date;
    }

    // Récupérer les conversations de l'utilisateur avec les participants
    const conversations = await this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate({
        path: 'participants',
        select: 'firstName lastName email avatarUrl online lastSeen',
      })
      .sort({ updatedAt: -1 })
      .lean<ConversationWithParticipants[]>();

    // Enrichir chaque conversation avec des informations supplémentaires
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation: ConversationWithParticipants) => {
        // Récupérer le dernier message
        const lastMessage = await this.messageModel
          .findOne({ conversation: conversation._id })
          .sort({ createdAt: -1 })
          .populate<{ sender: { _id: Types.ObjectId; firstName: string; lastName: string } }>('sender', 'firstName lastName')
          .lean()
          .exec();

        // Filtrer l'utilisateur actuel de la liste des participants
        const otherParticipants = conversation.participants.filter(
          (p) => p._id.toString() !== userId
        );

        // Compter les messages non lus
        const unreadCount = await this.messageModel.countDocuments({
          conversation: conversation._id,
          read: false,
          receiver: new Types.ObjectId(userId),
        });

        // Déterminer le type de conversation (groupe ou 1-1)
        const isGroup = conversation.participants.length > 2;
        
        // Pour les conversations 1-1, obtenir les informations de l'autre participant
        let chatTitle = conversation.title || '';
        let avatarUrl: string | undefined = undefined;
        let lastActivity = conversation.updatedAt;

        if (!isGroup && otherParticipants.length === 1) {
          const otherUser = otherParticipants[0];
          chatTitle = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim();
          avatarUrl = otherUser.avatarUrl;
        }

        // Mettre à jour la dernière activité si un message existe
        if (lastMessage?.createdAt) {
          lastActivity = lastMessage.createdAt;
        }

        return {
          id: conversation._id.toString(),
          chatTitle,
          avatarUrl,
          isGroup,
          participants: conversation.participants.map(p => ({
            id: p._id.toString(),
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            email: p.email || '',
            avatarUrl: p.avatarUrl,
            online: p.online || false,
            lastSeen: p.lastSeen,
          })),
          lastMessage: lastMessage ? {
            id: lastMessage._id.toString(),
            content: lastMessage.content || '',
            sender: lastMessage.sender ? {
              id: lastMessage.sender._id.toString(),
              firstName: lastMessage.sender.firstName || '',
              lastName: lastMessage.sender.lastName || '',
            } : null,
            createdAt: lastMessage.createdAt,
            isOutgoing: lastMessage.sender?._id.toString() === userId,
          } : null,
          unreadCount,
          lastActivity,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    // Trier par dernière activité
    return enrichedConversations.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    ) as any; // Type assertion temporaire
  }

  async checkUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.conversationModel
      .findOne({
        _id: new Types.ObjectId(conversationId),
        participants: new Types.ObjectId(userId),
      })
      .lean();
    
    return !!conversation;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur fait partie de la conversation
    const isInConversation = await this.checkUserInConversation(conversationId, userId);
    
    if (!isInConversation) {
      throw new NotFoundException('Conversation non trouvée ou accès non autorisé');
    }

    // Récupérer la conversation avec les participants
    const conversation = await this.conversationModel
      .findById(conversationId)
      .select('participants')
      .lean();

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Trouver les IDs des autres participants (tous sauf l'utilisateur connecté)
    const otherParticipants = conversation.participants
      .filter(participantId => participantId.toString() !== userId)
      .map(id => new Types.ObjectId(id.toString()));

    // Marquer comme lus uniquement les messages reçus des autres participants
    const result = await this.messageModel.updateMany(
      {
        conversation: new Types.ObjectId(conversationId),
        sender: { $in: otherParticipants }, // Uniquement les messages des autres participants
        receiver: new Types.ObjectId(userId), // Destinés à l'utilisateur connecté
        read: false,
      },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    // Mettre à jour la date de dernière lecture de la conversation
    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $set: { lastReadAt: new Date() } },
    );

    return {
      success: true,
      message: 'Messages marqués comme lus avec succès',
      updatedCount: result.modifiedCount,
    };
  }

  async getConversationMessages(conversationId: string, userId: string) {
    // Vérifie que l'utilisateur fait partie de la conversation
    const isInConversation = await this.checkUserInConversation(
      conversationId,
      userId,
    );

    if (!isInConversation) {
      throw new NotFoundException(
        'Conversation non trouvée ou accès non autorisé',
      );
    }

    // Récupère tous les messages de la conversation
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('messages')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Récupère les messages avec leurs détails
    const messages = await this.messageModel
      .find({ _id: { $in: conversation.messages } })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('parentMessage', 'content sender')
      .sort({ createdAt: 1 })
      .lean();

    return messages.map((message: any) => ({
      id: message._id.toString(),
      content: message.content,
      sender: {
        id: message.sender._id.toString(),
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
      },
      receiver: {
        id: message.receiver._id.toString(),
        firstName: message.receiver.firstName,
        lastName: message.receiver.lastName,
      },
      conversationId: conversationId,
      read: message.read,
      parentMessage: message.parentMessage
        ? {
            id: message.parentMessage._id.toString(),
            content: message.parentMessage.content,
            sender: {
              id: message.parentMessage.sender._id.toString(),
              firstName: message.parentMessage.sender.firstName,
              lastName: message.parentMessage.sender.lastName,
            },
          }
        : undefined,
      isReply: message.isReply,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }
}
