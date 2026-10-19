import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Session() session: UserSession) {
    return this.productsService.create(createProductDto, session.user.email);
  }

  @Post('sell-request')
  createSellRequest(@Body() createProductDto: CreateProductDto, @Session() session: UserSession) {
    return this.productsService.createSellRequest(createProductDto, session.user.id);
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|jpg)$/)) {
          return cb(new BadRequestException('Only JPG, PNG, and WEBP images are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }
    return {
      urls: files.map((file) => `http://localhost:3000/uploads/${file.filename}`),
    };
  }

  @Get()
  @AllowAnonymous()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('admin')
  findAllAdmin(@Session() session: UserSession) {
    return this.productsService.findAllAdmin(session.user.email);
  }

  @Get('pending')
  findPending(@Session() session: UserSession) {
    return this.productsService.findPending(session.user.email);
  }

  @Get('stock-history')
  findStockHistory(@Session() session: UserSession) {
    return this.productsService.findStockHistory(session.user.email);
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
    return this.productsService.approve(id, session.user.email);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
    return this.productsService.reject(id, session.user.email);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockDto,
    @Session() session: UserSession,
  ) {
    return this.productsService.updateStock(id, dto, session.user.email);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Session() session: UserSession,
  ) {
    return this.productsService.update(id, updateProductDto, session.user.email);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
    return this.productsService.remove(id, session.user.email);
  }
}