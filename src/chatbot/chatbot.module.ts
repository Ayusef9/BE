// chatbot/chatbot.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './chatbot.service.js';
import { ChatbotMessage } from './entities/chatbot-message.entity.js';
import { ChatbotSession } from './entities/chatbot-session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotSession, ChatbotMessage]), PlansModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}