import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  imports: [PrismaModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}