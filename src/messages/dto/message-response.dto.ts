import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsBoolean,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MessageResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsNotEmpty()
  @Type(() => Object)
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @IsObject()
  @IsNotEmpty()
  @Type(() => Object)
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  parentMessage?: {
    id: string;
    content: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };

  @IsBoolean()
  isReply: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
