import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  initialPrice: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsString()
  niche: string;

  @IsString()
  category: string;
}
