import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Contenu du message' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID du destinataire' })
  @IsNotEmpty()
  @IsMongoId()
  receiverId: string;

  @ApiProperty({ description: 'ID de la conversation' })
  @IsNotEmpty()
  @IsMongoId()
  conversationId: string;

  @ApiPropertyOptional({ description: 'URL de la pièce jointe (optionnel)' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  // Alias pour la compatibilité avec les deux versions
  get receiver(): string {
    return this.receiverId;
  }

  get conversation(): string {
    return this.conversationId;
  }
}
