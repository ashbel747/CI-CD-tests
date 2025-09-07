// src/cart/dto/add-to-cart.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number; // default 1
}

export class UpdateCartDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0) // Allow 0 to remove items
  quantity: number; // set to 0 to remove
}
