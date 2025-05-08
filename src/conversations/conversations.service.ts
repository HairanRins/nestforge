import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schema/conversation.schema';
import { UserService } from '../users/users.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private userService: UserService,
  ) {}

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
      .sort({ updatedAt: -1 })
      .exec();

    return conversations;
  }

  async findById(id: string) {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participants', 'firstName lastName email')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    return conversation;
  }
}
