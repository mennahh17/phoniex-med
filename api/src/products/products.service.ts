import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private checkOwner(userEmail: string, message: string) {
    if (userEmail !== process.env.OWNER_EMAIL) {
      throw new ForbiddenException(message);
    }
  }

  create(createProductDto: CreateProductDto, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can add products directly');

    const { images, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        status: 'approved',
        images: {
          create: images?.map((url) => ({ url })) || [],
        },
      },
      include: { images: true },
    });
  }

  async createSellRequest(createProductDto: CreateProductDto, userId: string) {
    const { images, status, isActive, ...productData } = createProductDto;

    const request = await this.prisma.product.create({
      data: {
        ...productData,
        status: 'pending',
        submittedBy: userId,
        images: images?.length
          ? { create: images.map((url) => ({ url })) }
          : undefined,
      },
      include: { images: true },
    });

    const seller = request.sellerName ?? request.sellerCompany ?? 'A customer';

    await this.notifications.notify(
      'sell_request',
      'New sell equipment request',
      `${seller} wants to sell "${request.name}" for ${request.price.toLocaleString()} EGP`,
      `/Requests/${request.id}`,
    );

    return request;
  }

  findAll() {
    return this.prisma.product.findMany({
      where: { status: 'approved', isActive: true },
      include: { images: true },
      orderBy: { id: 'desc' },
    });
  }

  findAllAdmin(userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can view all products');

    return this.prisma.product.findMany({
      where: { status: 'approved' },
      include: { images: true },
      orderBy: { id: 'desc' },
    });
  }

  findPending(userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can view pending requests');

    return this.prisma.product.findMany({
      where: { status: 'pending' },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  approve(id: number, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can approve requests');

    return this.prisma.product.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  reject(id: number, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can reject requests');

    return this.prisma.product.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can edit products');

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { images: true },
    });
  }

  remove(id: number, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can delete products');

    return this.prisma.$transaction([
      this.prisma.productImage.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
  }

  async updateStock(id: number, dto: UpdateStockDto, userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can update stock');

    let previousQty = 0;

    const updated = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');

      previousQty = product.quantity ?? 0;
      const newQty =
        dto.action === 'add' ? previousQty + dto.quantity
        : dto.action === 'remove' ? previousQty - dto.quantity
        : dto.quantity;

      if (newQty < 0) throw new BadRequestException('Stock cannot go below zero');
      if (newQty === previousQty) throw new BadRequestException('Quantity did not change');

      await tx.stockMovement.create({
        data: {
          productId: id,
          change: newQty - previousQty,
          previousQty,
          newQty,
          reason: dto.reason,
          note: dto.note,
          adminEmail: userEmail,
        },
      });

      return tx.product.update({
        where: { id },
        data: { quantity: newQty },
        include: { images: true },
      });
    });

    await this.notifications.stockAlert(updated, previousQty, updated.quantity ?? 0);

    return updated;
  }

  findStockHistory(userEmail: string) {
    this.checkOwner(userEmail, 'Only the site owner can view stock history');

    return this.prisma.stockMovement.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}