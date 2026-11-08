// chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import { VendorsModule } from '../vendors/vendors.module.js';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Vendor]), PlansModule, VendorsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}