import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { PackageItem } from './entities/package-item.entity.js';
import { Package } from './entities/package.entity.js';
import { ServiceCategory } from './entities/service-category.entity.js';
import { ServiceItem } from './entities/service-item.entity.js';
import { Vendor } from './entities/vendor.entity.js';
import { PackagesController } from './packages.controller.js';
import { PackagesService } from './packages.service.js';
import { ServiceCategoriesController } from './service-categories.controller.js';
import { ServiceCategoriesService } from './service-categories.service.js';
import { ServiceItemsController } from './service-items.controller.js';
import { ServiceItemsService } from './service-items.service.js';
import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, ServiceCategory, ServiceItem, Package, PackageItem]),
    UsersModule,
    AuthModule,
  ],
  controllers: [VendorsController, ServiceItemsController, PackagesController, ServiceCategoriesController],
  providers: [VendorsService, ServiceItemsService, PackagesService, ServiceCategoriesService],
  exports: [VendorsService],
})
export class VendorsModule {}
