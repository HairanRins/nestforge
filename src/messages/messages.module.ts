import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { MessageGateway } from './messages.gateway';
import { MessageService } from './messages.service';
import { MessageController } from './messages.controller';
import { MentionsService } from './mentions.service';
import { UserModule } from '../users/users.module';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schema/conversation.schema';
import { ConversationService } from '../conversations/conversations.service';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessageController],
  providers: [
    MessageGateway,
    MessageService,
    MentionsService,
    ConversationService,
    Logger,
  ],
  exports: [
    MessageService,
    MessageGateway,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
})
export class MessagesModule {}
