import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async send(@Req() req, @Body() dto: CreateMessageDto) {
    return this.messageService.sendMessage(
      req.user.userId,
      dto.receiverId,
      dto.content
    );
  }

  @Get()
  findAll(@Req() req) {
    return this.messageService.getMessages(req.user.userId);
  }
}
