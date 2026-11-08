// documents/documents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from '../deals/entities/deal.entity.js';
import { PlanNeed } from '../plans/entities/plan-need.entity.js';
import { PlansModule } from '../plans/plans.module.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentTask } from './entities/document-task.entity.js';
import { Receipt } from './entities/receipt.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentTask, Receipt, PlanNeed, Deal]), PlansModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}