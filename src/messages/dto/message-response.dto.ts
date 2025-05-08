import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MessageResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsUUID()
  conversationId: string;

  @IsNotEmpty()
  read: boolean;

  @IsNotEmpty()
  createdAt: Date;

  @IsNotEmpty()
  updatedAt: Date;
}
