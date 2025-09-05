import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  initialPrice: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsString()
  image: string;

  @IsString()
  niche: string;

  @IsString()
  category: string;
}
