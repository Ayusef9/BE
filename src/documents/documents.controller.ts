// documents/documents.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import multer from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { DocumentsService } from './documents.service.js';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto.js';
import { CreateDocumentTaskDto } from './dto/create-document-task.dto.js';
import { UpdateDocumentTaskDto } from './dto/update-document-task.dto.js';
import { UploadReceiptDto } from './dto/upload-receipt.dto.js';

const receiptStorage = multer.diskStorage({
  destination: './uploads/receipts', // folder dibuat otomatis oleh multer
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

@ApiTags('documents')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ---- checklist berkas administrasi

  @Post('tasks')
  createTask(@CurrentUser() user: AuthUser, @Body() dto: CreateDocumentTaskDto) {
    return this.documentsService.createTask(user.id, dto);
  }

  @Get('tasks')
  listTasks(@CurrentUser() user: AuthUser, @Query('planId', ParseUUIDPipe) planId: string) {
    return this.documentsService.listTasks(user.id, planId);
  }

  @Patch('tasks/:id')
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentTaskDto,
  ) {
    return this.documentsService.updateTask(user.id, id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  async removeTask(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.documentsService.removeTask(user.id, id);
  }

  // ---- arsip bukti transaksi

  @Post('receipts')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: receiptStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
    }),
  )
  uploadReceipt(
    @CurrentUser() user: AuthUser,
    @Body() dto: UploadReceiptDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.uploadReceipt(user.id, dto, file);
  }

  @Get('receipts')
  listReceipts(@CurrentUser() user: AuthUser, @Query('planId', ParseUUIDPipe) planId: string) {
    return this.documentsService.listReceipts(user.id, planId);
  }

  @Patch('receipts/:id/confirm')
  confirmReceipt(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmReceiptDto,
  ) {
    return this.documentsService.confirmReceipt(user.id, id, dto);
  }
}