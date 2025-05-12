import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schema/user.schema';
import { Message } from './schema/message.schema';

@Injectable()
export class MentionsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async detectMentions(content: string): Promise<string[]> {
    const mentionRegex = /@([\w]+)/g;
    const mentions = new Set<string>();

    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.add(match[1]);
    }

    return Array.from(mentions);
  }

  async validateMentions(mentions: string[]): Promise<string[]> {
    const validMentions = await this.userModel.find({
      $or: [
        { firstName: { $in: mentions } },
        { username: { $in: mentions } }
      ]
    });

    if (validMentions.length === 0) {
      return [];
    }

    // Retourner les IDs des utilisateurs trouvés
    return validMentions.map(user => user._id.toString());
  }

  async createMentionsNotification(
    messageId: string,
    mentionedUsers: string[],
  ) {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    const mentionedUserIds = await this.userModel
      .find({
        firstName: { $in: mentionedUsers },
      })
      .distinct('_id');

    message.mentions = mentionedUserIds;
    message.notifications = mentionedUserIds.map((userId) => ({
      userId,
      read: false,
    }));

    await message.save();
    return message;
  }
}
