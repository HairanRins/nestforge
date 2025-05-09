import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  parentMessage: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isReply: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  mentions: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        read: { type: Boolean, default: false },
      },
    ],
  })
  notifications: Array<{ userId: Types.ObjectId; read: boolean }>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
