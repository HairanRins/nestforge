import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationController } from './conversations.controller';
import { ConversationService } from './conversations.service';
import { Conversation, ConversationSchema } from './schema/conversation.schema';
import { UserModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UserModule,
    MessagesModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationsModule {}
