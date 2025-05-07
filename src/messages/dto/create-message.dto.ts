import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  senderId: string;

  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

}
