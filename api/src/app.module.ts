import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth.js';
import { OrdersModule } from './orders/orders.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'products-api',
    }),
    ProductsModule,
    PrismaModule,
    AuthModule.forRoot(auth),
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}