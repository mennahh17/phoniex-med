import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const CLOSED = ['rejected', 'cancelled'];

type Tx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private isAdmin(userEmail: string) {
    return userEmail === process.env.OWNER_EMAIL;
  }

  private checkOwner(userEmail: string, message: string) {
    if (!this.isAdmin(userEmail)) {
      throw new ForbiddenException(message);
    }
  }

  private async restoreStock(tx: Tx, orderId: number, reason: string, byEmail: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const previousQty = product.quantity ?? 0;
      const newQty = previousQty + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: newQty },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          change: item.quantity,
          previousQty,
          newQty,
          reason,
          adminEmail: byEmail,
        },
      });
    }
  }

    async create(createOrderDto: CreateOrderDto, userId: string) {
    const requested = new Map<number, number>();
    for (const item of createOrderDto.items) {
      requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity);
    }

    const byEmail = createOrderDto.email ?? userId;

    const stockChanges: {                                                    // ← أ. جديد
      product: { id: number; name: string; lowStockThreshold: number | null };
      previousQty: number;
      newQty: number;
    }[] = [];

    const order = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...requested.keys()] } },
      });

      for (const [productId, qty] of requested) {
        const product = products.find((p) => p.id === productId);
        if (!product || product.status !== 'approved' || !product.isActive) {
          throw new BadRequestException(`Product #${productId} is not available`);
        }
        if ((product.quantity ?? 0) < qty) {
          throw new BadRequestException(`Only ${product.quantity ?? 0} left of "${product.name}"`);
        }
      }

      const items = createOrderDto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: product.id,
          productName: product.name,
          price: product.salePrice ?? product.regularPrice ?? product.price,
          quantity: item.quantity,
        };
      });

      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          items: { create: items },
          deliveryAddress: createOrderDto.deliveryAddress,
          phone: createOrderDto.phone,
          email: createOrderDto.email,
          country: createOrderDto.country,
          firstName: createOrderDto.firstName,
          lastName: createOrderDto.lastName,
          city: createOrderDto.city,
          governorate: createOrderDto.governorate,
        },
        include: { items: true },
      });

      for (const [productId, qty] of requested) {
        const product = products.find((p) => p.id === productId)!;
        const previousQty = product.quantity ?? 0;

        const result = await tx.product.updateMany({
          where: { id: productId, quantity: { gte: qty } },
          data: { quantity: { decrement: qty } },
        });
        if (result.count === 0) {
          throw new BadRequestException(`"${product.name}" just went out of stock`);
        }

        await tx.stockMovement.create({
          data: {
            productId,
            change: -qty,
            previousQty,
            newQty: previousQty - qty,
            reason: `Order #${order.id}`,
            adminEmail: byEmail,
          },
        });

        stockChanges.push({ product, previousQty, newQty: previousQty - qty });   // ← ب. جديد
      }

      return order;
    });

    const customer = `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim() || 'A customer';

    await this.notifications.notify(
      'new_order',
      `New order #${order.id}`,
      `${customer} placed an order for ${order.totalPrice.toLocaleString()} EGP`,
      `/Order/details/${order.id}`,
    );

    for (const change of stockChanges) {                                     // ← ج. جديد
      await this.notifications.stockAlert(change.product, change.previousQty, change.newQty);
    }

    return order;
  }

  findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string, userEmail: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (!this.isAdmin(userEmail) && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  update(id: number, updateOrderDto: UpdateOrderDto, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can edit orders');

    const { status, items, ...data } = updateOrderDto as UpdateOrderDto & {
      status?: string;
      items?: unknown;
    };

    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async cancelOrder(id: number, userId: string, userEmail: string) {
    const admin = this.isAdmin(userEmail);

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Order not found');

      if (!admin && order.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own orders');
      }
      if (CLOSED.includes(order.status)) {
        throw new BadRequestException(`Order is already ${order.status}`);
      }
      if (!admin && order.status !== 'pending') {
        throw new BadRequestException('Order can no longer be cancelled');
      }

      await this.restoreStock(tx, id, `Order #${id} cancelled`, userEmail);

      return tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
      });
    });

    if (!admin) {
      await this.notifications.notify(
        'order_cancelled',
        `Order #${id} cancelled`,
        `The customer cancelled order #${id}. Stock has been restored.`,
        `/Order/details/${id}`,
      );
    }

    return cancelled;
  }

  async updateStatus(id: number, status: string, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can update orders');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Order not found');
      if (CLOSED.includes(order.status)) {
        throw new BadRequestException(`Order is already ${order.status}`);
      }

      if (CLOSED.includes(status)) {
        await this.restoreStock(tx, id, `Order #${id} ${status}`, userEmail);
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });
  }

  findAll(userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can view all orders');

    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}