import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  receiverId?: string;
}
