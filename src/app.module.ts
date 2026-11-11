import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { validateEnv } from './config/env.validation.js';
import { LogMiddlewareMiddleware } from './middleware/log-middleware/log-middleware.middleware.js';
import { ALL_ENTITIES } from './database/entities.js';
import { PlansModule } from './plans/plans.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { UsersModule } from './users/users.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { DealsModule } from './deals/deals.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ChatbotModule } from './chatbot/chatbot.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { SavingsModule } from './savings/savings.module.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5434')),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', 'secret'),
        database: config.get<string>('DB_DATABASE', 'wedding'),
        entities: ALL_ENTITIES,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    UsersModule,
    AuthModule,
    VendorsModule,
    AdminModule,
    PlansModule,
    RecommendationsModule,
    DealsModule,
    ChatModule,
    ChatbotModule,
    DocumentsModule,
    SavingsModule,
    SchedulerModule,
    TasksModule,
    ReviewsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Urutan penting: JwtAuthGuard (siapa kamu) dulu, baru RolesGuard (boleh masuk?)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddlewareMiddleware).forRoutes('*');
  }
}