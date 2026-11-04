import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { VendorsModule } from '../vendors/vendors.module.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [UsersModule, VendorsModule],
  controllers: [AdminController],
})
export class AdminModule {}
