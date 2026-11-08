// chatbot/chatbot.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { ChatbotService } from './chatbot.service.js';
import { SendChatbotMessageDto } from './dto/send-chatbot-message.dto.js';

@ApiTags('chatbot')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('messages')
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: SendChatbotMessageDto) {
    return this.chatbotService.sendMessage(user.id, dto);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthUser) {
    return this.chatbotService.listSessions(user.id);
  }

  @Get('sessions/:id/messages')
  getMessages(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatbotService.getMessages(user.id, id);
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  async removeSession(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.chatbotService.removeSession(user.id, id);
  }
}