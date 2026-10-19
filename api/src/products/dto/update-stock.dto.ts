import { IsIn, IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsIn(['add', 'remove', 'set'])
  action: 'add' | 'remove' | 'set';

  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  note?: string;
}