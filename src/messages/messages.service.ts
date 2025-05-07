import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { Conversation } from '../conversations/schema/conversation.schema';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>
  ) {}

  async create(createMessageDto: { content: string; sender: string; conversation: string; receiver: string }) {
    const message = new this.messageModel({
      ...createMessageDto,
      sender: new Types.ObjectId(createMessageDto.sender),
      receiver: new Types.ObjectId(createMessageDto.receiver),
      conversation: new Types.ObjectId(createMessageDto.conversation)
    });
    return message.save();
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.messageModel.create({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      content
    });
  }

  async getMessages(userId: string) {
    return this.messageModel.find({
      $or: [
        { sender: new Types.ObjectId(userId) },
        { receiver: new Types.ObjectId(userId) }
      ]
    })
    .populate('sender', 'firstName lastName email')
    .populate('receiver', 'firstName lastName email')
    .sort({ createdAt: 1 });
  }

  async getConversationMessages(conversationId: string, userId: string) {
    return this.messageModel.find({
      conversation: new Types.ObjectId(conversationId),
      $or: [
        { sender: new Types.ObjectId(userId) },
        { receiver: new Types.ObjectId(userId) }
      ]
    })
    .populate('sender', 'firstName lastName email')
    .populate('receiver', 'firstName lastName email')
    .sort({ createdAt: 1 });
  }

  async getUserConversations(userId: string) {
    const messages = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: new Types.ObjectId(userId) },
            { receiver: new Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    // Populate les informations des utilisateurs pour chaque message
    const populatedMessages = await this.messageModel.populate(messages, [
      { path: 'lastMessage.sender', select: 'firstName lastName email' },
      { path: 'lastMessage.receiver', select: 'firstName lastName email' }
    ]);

    return populatedMessages;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    this.logger.debug(`Marking messages as read for conversation: ${conversationId} and user: ${userId}`);
    
    try {
      const result = await this.messageModel.updateMany(
        {
          conversation: new Types.ObjectId(conversationId),
          $or: [
            { receiver: new Types.ObjectId(userId) },
            { sender: new Types.ObjectId(userId) }
          ],
          read: false
        },
        {
          $set: { read: true }
        }
      );

      this.logger.debug(`Update result: ${JSON.stringify(result)}`);

      // Vérifier si les messages ont été mis à jour
      const updatedMessages = await this.messageModel.find({
        conversation: new Types.ObjectId(conversationId),
        $or: [
          { receiver: new Types.ObjectId(userId) },
          { sender: new Types.ObjectId(userId) }
        ]
      });

      this.logger.debug(`Found ${updatedMessages.length} messages in conversation`);
      this.logger.debug(`Messages status: ${JSON.stringify(updatedMessages.map(m => ({ id: m._id, read: m.read })))}`);

      return {
        success: true,
        updatedCount: result.modifiedCount,
        totalMessages: updatedMessages.length,
        messages: updatedMessages
      };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      throw error;
    }
  }

  async getUnreadMessagesCount(userId: string) {
    return this.messageModel.countDocuments({
      receiver: new Types.ObjectId(userId),
      read: false
    });
  }

  async getMessagesByReceiver(userId: string, receiverId: string) {
    return this.messageModel.find({
      $or: [
        { sender: new Types.ObjectId(userId), receiver: new Types.ObjectId(receiverId) },
        { sender: new Types.ObjectId(receiverId), receiver: new Types.ObjectId(userId) }
      ]
    })
    .populate('sender', 'firstName lastName email')
    .populate('receiver', 'firstName lastName email')
    .sort({ createdAt: 1 });
  }

  async markMessageAsRead(messageId: string, userId: string) {
    this.logger.debug(`Marking message ${messageId} as read for user: ${userId}`);
    
    try {
      const result = await this.messageModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(messageId),
          $or: [
            { receiver: new Types.ObjectId(userId) },
            { sender: new Types.ObjectId(userId) }
          ],
          read: false
        },
        {
          $set: { read: true }
        },
        { new: true }
      );

      if (!result) {
        this.logger.debug(`No message found with id: ${messageId} or message already read`);
        return {
          success: false,
          message: 'Message not found or already read',
          updatedMessage: null
        };
      }

      this.logger.debug(`Message updated successfully: ${JSON.stringify(result)}`);

      return {
        success: true,
        message: 'Message marked as read',
        updatedMessage: result
      };
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      throw error;
    }
  }

  async addUserToConversation(conversationId: string, userId: string, newUserId: string) {
    this.logger.debug(`Adding user ${newUserId} to conversation ${conversationId} by user ${userId}`);
    
    try {
      // Vérifier si l'utilisateur qui fait la demande est dans la conversation
      const conversation = await this.conversationModel.findById(conversationId);
      
      if (!conversation) {
        this.logger.debug(`Conversation ${conversationId} not found`);
        return {
          success: false,
          message: 'Conversation not found'
        };
      }

      if (!conversation.participants.includes(new Types.ObjectId(userId))) {
        this.logger.debug(`User ${userId} is not part of conversation ${conversationId}`);
        return {
          success: false,
          message: 'You are not part of this conversation'
        };
      }

      // Vérifier si le nouvel utilisateur est déjà dans la conversation
      if (conversation.participants.includes(new Types.ObjectId(newUserId))) {
        this.logger.debug(`User ${newUserId} is already part of conversation ${conversationId}`);
        return {
          success: false,
          message: 'User is already part of this conversation'
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
        read: false
      });

      this.logger.debug(`Welcome message created: ${JSON.stringify(welcomeMessage)}`);

      return {
        success: true,
        message: 'User added to conversation successfully',
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          updatedAt: conversation.updatedAt
        }
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
          { receiver: new Types.ObjectId(userId) }
        ]
      });

      if (!message) {
        this.logger.debug(`Message ${messageId} not found or user ${userId} not authorized`);
        return {
          success: false,
          message: 'Message not found or you are not authorized to delete it'
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
          createdAt: message.createdAt
        }
      };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async removeUserFromConversation(conversationId: string, userId: string, userToRemoveId: string) {
    this.logger.debug(`Removing user ${userToRemoveId} from conversation ${conversationId} by user ${userId}`);
    
    try {
      // Vérifier si la conversation existe
      const conversation = await this.conversationModel.findById(conversationId);
      
      if (!conversation) {
        this.logger.debug(`Conversation ${conversationId} not found`);
        return {
          success: false,
          message: 'Conversation not found'
        };
      }

      // Vérifier si l'utilisateur qui fait la demande est dans la conversation
      if (!conversation.participants.includes(new Types.ObjectId(userId))) {
        this.logger.debug(`User ${userId} is not part of conversation ${conversationId}`);
        return {
          success: false,
          message: 'You are not part of this conversation'
        };
      }

      // Vérifier si l'utilisateur à supprimer est dans la conversation
      if (!conversation.participants.includes(new Types.ObjectId(userToRemoveId))) {
        this.logger.debug(`User ${userToRemoveId} is not part of conversation ${conversationId}`);
        return {
          success: false,
          message: 'User is not part of this conversation'
        };
      }

      // Vérifier s'il reste au moins 2 participants après la suppression
      if (conversation.participants.length <= 2) {
        this.logger.debug(`Cannot remove user: conversation would have less than 2 participants`);
        return {
          success: false,
          message: 'Cannot remove user: conversation must have at least 2 participants'
        };
      }

      // Supprimer l'utilisateur des participants
      conversation.participants = conversation.participants.filter(
        participant => !participant.equals(new Types.ObjectId(userToRemoveId))
      );
      await conversation.save();

      this.logger.debug(`User ${userToRemoveId} removed from conversation participants`);

      // Créer un message de notification
      const notificationMessage = await this.messageModel.create({
        content: `Un utilisateur a quitté la conversation`,
        sender: new Types.ObjectId(userId),
        receiver: new Types.ObjectId(userToRemoveId),
        conversation: new Types.ObjectId(conversationId),
        read: false
      });

      this.logger.debug(`Notification message created: ${JSON.stringify(notificationMessage)}`);

      return {
        success: true,
        message: 'User removed from conversation successfully',
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          updatedAt: conversation.updatedAt
        }
      };
    } catch (error) {
      this.logger.error(`Error removing user from conversation: ${error.message}`);
      throw error;
    }
  }
}
