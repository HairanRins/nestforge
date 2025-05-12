import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants: Types.ObjectId[];

  @Prop({ default: false })
  isSelfNote: boolean;

  @Prop()
  createdAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];

  @Prop()
  updatedAt: Date;

  @Prop()
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
