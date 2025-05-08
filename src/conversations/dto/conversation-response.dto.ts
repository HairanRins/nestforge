import { UserResponseDto } from '../../users/dto/user-response.dto';
import { MessageResponseDto } from '../../messages/dto/message-response.dto';

export class ConversationResponseDto {
  id: string;
  participants: UserResponseDto[];
  lastMessage: MessageResponseDto | null;
  createdAt: Date;
  updatedAt: Date;
}
