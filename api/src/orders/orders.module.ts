import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NotificationsModule],
})
export class OrdersModule {}
