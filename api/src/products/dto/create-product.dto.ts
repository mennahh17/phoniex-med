import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsString()
  @IsOptional()
  stockStatus?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  regularPrice?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsString()
  @IsOptional()
  partNumber?: string;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  accessories?: string;

  @IsString()
  @IsOptional()
  manufactureYear?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsString()
  @IsOptional()
  technicalSpecs?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsString()
  @IsOptional()
  sellerPhone?: string;

  @IsEmail()
  @IsOptional()
  sellerEmail?: string;

  @IsString()
  @IsOptional()
  sellerCompany?: string;

  @IsString()
  @IsOptional()
  sellerMessage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];

  @IsString()
  @IsOptional()
  category?: string ;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}