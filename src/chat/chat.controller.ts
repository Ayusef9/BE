// chat/chat.controller.ts
import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { ChatService } from './chat.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { QueryMessagesDto } from './dto/query-messages.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@ApiTags('chat')
@ApiBearerAuth()
@Roles(Role.USER, Role.VENDOR)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @Roles(Role.USER)
  openConversation(@CurrentUser() user: AuthUser, @Body() dto: CreateConversationDto) {
    return this.chatService.openConversation(user.id, dto);
  }

  @Get('conversations')
  findMine(@CurrentUser() user: AuthUser) {
    return this.chatService.findMine(user);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.chatService.getMessages(user, id, query);
  }

  @Patch('conversations/:id/read')
  @HttpCode(204)
  async markRead(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.chatService.markRead(user, id);
  }

  @Post('messages')
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(user, dto);
  }
}