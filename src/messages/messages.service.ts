import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { Conversation } from '../conversations/schema/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { MentionsService } from './mentions.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    private mentionsService: MentionsService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<MessageDocument> {
    this.logger.debug(
      `Creating message from ${senderId} to ${createMessageDto.receiver} in conversation ${createMessageDto.conversation}`,
    );

    try {
      // Vérifier si l'utilisateur fait partie de la conversation
      const conversation = await this.conversationModel.findOne({
        _id: new Types.ObjectId(createMessageDto.conversation),
        participants: {
          $all: [
            new Types.ObjectId(senderId),
            new Types.ObjectId(createMessageDto.receiver),
          ],
        },
      });

      if (!conversation) {
        this.logger.warn(
          `User ${senderId} or receiver ${createMessageDto.receiver} not in conversation ${createMessageDto.conversation}`,
        );
        throw new NotFoundException(
          'Conversation not found or users are not participants',
        );
      }

      const message = new this.messageModel({
        content: createMessageDto.content,
        sender: new Types.ObjectId(senderId),
        receiver: new Types.ObjectId(createMessageDto.receiver),
        conversation: new Types.ObjectId(createMessageDto.conversation),
        attachmentUrl: createMessageDto.attachmentUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as MessageDocument;

      const savedMessage = await message.save();

      // Process mentions
      const mentions = await this.mentionsService.detectMentions(
        createMessageDto.content,
      );
      if (mentions.length > 0) {
        await this.mentionsService.validateMentions(mentions);
        await this.mentionsService.createMentionsNotification(
          savedMessage._id.toString(),
          mentions,
        );
      }

      return savedMessage;

      this.logger.debug(`Message created successfully: ${savedMessage._id}`);
      return savedMessage;
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    this.logger.debug(
      `Sending direct message from ${senderId} to ${receiverId}`,
    );

    try {
      // Trouver une conversation existante entre les deux utilisateurs ou en créer une nouvelle
      let conversation = await this.conversationModel.findOne({
        participants: {
          $all: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)],
        },
      });

      if (!conversation) {
        this.logger.debug(`No existing conversation found, creating new one`);
        conversation = await this.conversationModel.create({
          participants: [
            new Types.ObjectId(senderId),
            new Types.ObjectId(receiverId),
          ],
        });
      }

      const message = await this.messageModel.create({
        content,
        sender: new Types.ObjectId(senderId),
        receiver: new Types.ObjectId(receiverId),
        conversation: conversation._id,
        read: false,
      });

      this.logger.debug(`Direct message sent successfully: ${message._id}`);
      return message;
    } catch (error) {
      this.logger.error(`Error sending direct message: ${error.message}`);
      throw error;
    }
  }

  async getMessages(userId: string) {
    const messages = await this.messageModel
      .find({
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
      })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('parentMessage', 'content sender')
      .sort({ createdAt: 1 });

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
      conversationId: message.conversation.toString(),
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

  async getConversationMessages(conversationId: string, userId: string) {
    // Vérifie que l'utilisateur fait partie de la conversation
    const isInConversation = await this.messageModel.findOne({
      conversation: new Types.ObjectId(conversationId),
      $or: [
        { sender: new Types.ObjectId(userId) },
        { receiver: new Types.ObjectId(userId) },
      ],
    });

    if (!isInConversation) {
      throw new NotFoundException(
        'Conversation non trouvée ou accès non autorisé',
      );
    }

    // Récupère tous les messages
    const messages = await this.messageModel
      .find({
        conversation: new Types.ObjectId(conversationId),
      })
      .select('-__v')
      .populate('sender', '_id firstName lastName')
      .populate('receiver', '_id firstName lastName')
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
      conversationId: message.conversation.toString(),
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

  async getUserConversations(userId: string) {
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: new Types.ObjectId(userId) },
            { receiver: new Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'lastMessage.sender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'lastMessage.receiver',
        },
      },
      {
        $addFields: {
          'lastMessage.sender': {
            $arrayElemAt: ['$lastMessage.sender._id', 0],
          },
          'lastMessage.receiver': {
            $arrayElemAt: ['$lastMessage.receiver._id', 0],
          },
        },
      },
    ]);

    return conversations;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    this.logger.debug(
      `Marking messages as read for conversation: ${conversationId} and user: ${userId}`,
    );

    try {
      const result = await this.messageModel.updateMany(
        {
          conversation: new Types.ObjectId(conversationId),
          $or: [
            { receiver: new Types.ObjectId(userId) },
            { sender: new Types.ObjectId(userId) },
          ],
          read: false,
        },
        {
          $set: { read: true },
        },
      );

      this.logger.debug(`Update result: ${JSON.stringify(result)}`);

      // Vérifier si les messages ont été mis à jour
      const updatedMessages = await this.messageModel.find({
        conversation: new Types.ObjectId(conversationId),
        $or: [
          { receiver: new Types.ObjectId(userId) },
          { sender: new Types.ObjectId(userId) },
        ],
      });

      this.logger.debug(
        `Found ${updatedMessages.length} messages in conversation`,
      );
      this.logger.debug(
        `Messages status: ${JSON.stringify(updatedMessages.map((m) => ({ id: m._id, read: m.read })))}`,
      );

      return {
        success: true,
        updatedCount: result.modifiedCount,
        totalMessages: updatedMessages.length,
        messages: updatedMessages,
      };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      throw error;
    }
  }

  async getUnreadMessagesCount(userId: string) {
    return this.messageModel.countDocuments({
      $or: [
        { receiver: new Types.ObjectId(userId), read: false },
        { sender: new Types.ObjectId(userId), read: false },
      ],
    });
  }

  async getMessagesByReceiver(userId: string, receiverId: string) {
    const messages = await this.messageModel
      .find({
        $or: [
          {
            sender: new Types.ObjectId(userId),
            receiver: new Types.ObjectId(receiverId),
          },
          {
            sender: new Types.ObjectId(receiverId),
            receiver: new Types.ObjectId(userId),
          },
        ],
      })
      .select('-__v')
      .populate('sender', '_id firstName lastName')
      .populate('receiver', '_id firstName lastName')
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
      conversationId: message.conversation.toString(),
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

  async replyToMessage(
    messageId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    this.logger.debug(`Replying to message ${messageId} by user ${senderId}`);

    try {
      // Vérifier que le message existe
      const message = await this.messageModel.findById(messageId);

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      // Vérifier que l'utilisateur est le receiver du message
      if (message.receiver.toString() !== senderId) {
        throw new NotFoundException('User is not the receiver of this message');
      }

      // Process mentions
      const mentions = await this.mentionsService.detectMentions(content);
      if (mentions.length > 0) {
        await this.mentionsService.validateMentions(mentions);
      }

      // Créer la réponse
      const reply = await this.messageModel.create({
        content,
        sender: new Types.ObjectId(senderId),
        receiver: message.sender,
        conversation: message.conversation,
        parentMessage: message,
        isReply: true,
        mentions:
          mentions.length > 0
            ? await this.mentionsService.createMentionsNotification(
                messageId,
                mentions,
              )
            : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return reply;
    } catch (error) {
      this.logger.error(`Error replying to message: ${error.message}`);
      throw error;
    }
  }

  // ...
  async markMessageAsRead(messageId: string, userId: string) {
    this.logger.debug(
      `Marking message ${messageId} as read for user: ${userId}`,
    );

    try {
      const result = await this.messageModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(messageId),
          $or: [
            { receiver: new Types.ObjectId(userId) },
            { sender: new Types.ObjectId(userId) },
          ],
          read: false,
        },
        {
          $set: { read: true },
        },
        { new: true },
      );

      if (!result) {
        this.logger.debug(
          `No message found with id: ${messageId} or message already read`,
        );
        return {
          success: false,
          message: 'Message not found or already read',
          updatedMessage: null,
        };
      }

      this.logger.debug(
        `Message updated successfully: ${JSON.stringify(result)}`,
      );

      return {
        success: true,
        message: 'Message marked as read',
        updatedMessage: result,
      };
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      throw error;
    }
  }

  async addUserToConversation(
    conversationId: string,
    userId: string,
    newUserId: string,
  ) {
    this.logger.debug(
      `Adding user ${newUserId} to conversation ${conversationId} by user ${userId}`,
    );

    try {
      // Vérifier si l'utilisateur qui fait la demande est dans la conversation
      const conversation =
        await this.conversationModel.findById(conversationId);

      if (!conversation) {
        this.logger.debug(`Conversation ${conversationId} not found`);
        return {
          success: false,
          message: 'Conversation not found',
        };
      }

      if (!conversation.participants.includes(new Types.ObjectId(userId))) {
        this.logger.debug(
          `User ${userId} is not part of conversation ${conversationId}`,
        );
        return {
          success: false,
          message: 'You are not part of this conversation',
        };
      }

      // Vérifier si le nouvel utilisateur est déjà dans la conversation
      if (conversation.participants.includes(new Types.ObjectId(newUserId))) {
        this.logger.debug(
          `User ${newUserId} is already part of conversation ${conversationId}`,
        );
        return {
          success: false,
          message: 'User is already part of this conversation',
        };
      }

      // Ajouter le nouvel utilisateur aux participants
      conversation.participants.push(new Types.ObjectId(newUserId));
      await conversation.save();

      this.logger.debug(`User ${newUserId} added to conversation participants`);

      // Créer un message de bienvenue pour le nouvel utilisateur
      const welcomeMessage = await this.messageModel.create({
        content: `Un nouvel utilisateur a rejoint la conversation`,
        sender: new Types.ObjectId(userId),
        receiver: new Types.ObjectId(newUserId),
        conversation: new Types.ObjectId(conversationId),
        read: false,
      });

      this.logger.debug(
        `Welcome message created: ${JSON.stringify(welcomeMessage)}`,
      );

      return {
        success: true,
        message: 'User added to conversation successfully',
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          updatedAt: conversation.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error adding user to conversation: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string) {
    this.logger.debug(`Deleting message ${messageId} by user ${userId}`);

    try {
      // Vérifier si le message existe et si l'utilisateur est autorisé à le supprimer
      const message = await this.messageModel.findOne({
        _id: new Types.ObjectId(messageId),
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
      });

      if (!message) {
        this.logger.debug(
          `Message ${messageId} not found or user ${userId} not authorized`,
        );
        return {
          success: false,
          message: 'Message not found or you are not authorized to delete it',
        };
      }

      // Supprimer le message
      await this.messageModel.deleteOne({ _id: new Types.ObjectId(messageId) });

      this.logger.debug(`Message ${messageId} deleted successfully`);

      return {
        success: true,
        message: 'Message deleted successfully',
        deletedMessage: {
          id: message._id,
          content: message.content,
          sender: message.sender,
          receiver: message.receiver,
          conversation: message.conversation,
          createdAt: message.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async removeUserFromConversation(
    conversationId: string,
    userId: string,
    userToRemoveId: string,
  ) {
    this.logger.debug(
      `Removing user ${userToRemoveId} from conversation ${conversationId} by user ${userId}`,
    );

    try {
      // Vérifier si la conversation existe
      const conversation =
        await this.conversationModel.findById(conversationId);

      if (!conversation) {
        this.logger.debug(`Conversation ${conversationId} not found`);
        return {
          success: false,
          message: 'Conversation not found',
        };
      }

      // Vérifier si l'utilisateur qui fait la demande est dans la conversation
      if (!conversation.participants.includes(new Types.ObjectId(userId))) {
        this.logger.debug(
          `User ${userId} is not part of conversation ${conversationId}`,
        );
        return {
          success: false,
          message: 'You are not part of this conversation',
        };
      }

      // Vérifier si l'utilisateur à supprimer est dans la conversation
      if (
        !conversation.participants.includes(new Types.ObjectId(userToRemoveId))
      ) {
        this.logger.debug(
          `User ${userToRemoveId} is not part of conversation ${conversationId}`,
        );
        return {
          success: false,
          message: 'User is not part of this conversation',
        };
      }

      // Vérifier s'il reste au moins 2 participants après la suppression
      if (conversation.participants.length <= 2) {
        this.logger.debug(
          `Cannot remove user: conversation would have less than 2 participants`,
        );
        return {
          success: false,
          message:
            'Cannot remove user: conversation must have at least 2 participants',
        };
      }

      // Supprimer l'utilisateur des participants
      conversation.participants = conversation.participants.filter(
        (participant) =>
          !participant.equals(new Types.ObjectId(userToRemoveId)),
      );
      await conversation.save();

      this.logger.debug(
        `User ${userToRemoveId} removed from conversation participants`,
      );

      // Créer un message de notification
      const notificationMessage = await this.messageModel.create({
        content: `Un utilisateur a quitté la conversation`,
        sender: new Types.ObjectId(userId),
        receiver: new Types.ObjectId(userToRemoveId),
        conversation: new Types.ObjectId(conversationId),
        read: false,
      });

      this.logger.debug(
        `Notification message created: ${JSON.stringify(notificationMessage)}`,
      );

      return {
        success: true,
        message: 'User removed from conversation successfully',
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          updatedAt: conversation.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error removing user from conversation: ${error.message}`,
      );
      throw error;
    }
  }

  // Replace your getAllMessagesWithDetails method with this fixed version
  async getAllMessagesWithDetails(userId: string) {
    this.logger.debug(`Getting all messages with details for user: ${userId}`);

    try {
      // 1. Trouver toutes les conversations auxquelles l'utilisateur participe
      const userConversations = await this.messageModel.distinct(
        'conversation',
        {
          $or: [
            { sender: new Types.ObjectId(userId) },
            { receiver: new Types.ObjectId(userId) },
          ],
        },
      );

      this.logger.debug(
        `Found ${userConversations.length} conversations for user ${userId}`,
      );

      // 2. Pour chaque conversation, récupérer tous les messages et les participants
      const conversationsWithMessages = await Promise.all(
        userConversations.map(async (conversationId) => {
          // Récupérer les informations de la conversation
          const conversationDetails = await this.conversationModel
            .findById(conversationId)
            .lean();

          // Récupérer les participants avec leurs détails
          const participants = await this.conversationModel.aggregate([
            {
              $match: {
                _id: conversationId,
              },
            },
            {
              $unwind: '$participants',
            },
            {
              $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'userDetails',
              },
            },
            {
              $unwind: '$userDetails',
            },
            {
              $project: {
                _id: '$userDetails._id',
                firstName: '$userDetails.firstName',
                lastName: '$userDetails.lastName',
                email: '$userDetails.email',
              },
            },
          ]);

          // Récupérer tous les messages de la conversation
          const messages = await this.messageModel
            .find({
              conversation: conversationId,
            })
            .select('-__v')
            .populate('sender', '_id firstName lastName email')
            .populate('receiver', '_id firstName lastName email')
            .sort({ createdAt: 1 })
            .lean();

          this.logger.debug(
            `Found ${messages.length} messages in conversation ${conversationId}`,
          );

          // Add null check to prevent the error
          const unreadCount = messages.filter(
            (msg) =>
              msg.receiver &&
              msg.receiver._id &&
              msg.receiver._id.toString() === userId &&
              !msg.read,
          ).length;

          return {
            conversationId,
            conversationDetails,
            participants,
            messages,
            unreadCount,
          };
        }),
      );

      return {
        success: true,
        totalConversations: conversationsWithMessages.length,
        conversations: conversationsWithMessages,
      };
    } catch (error) {
      this.logger.error(
        `Error getting all messages with details: ${error.message}`,
      );
      throw error;
    }
  }
}
