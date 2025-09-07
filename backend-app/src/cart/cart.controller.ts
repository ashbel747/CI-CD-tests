// src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('cart')
@UseGuards(AuthenticationGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Put()
  updateCart(@Req() req, @Body() dto: UpdateCartDto) {
    return this.cartService.updateCart(req.user.id, dto);
  }

  @Post('checkout')
  checkout(@Req() req) {
    return this.cartService.checkout(req.user.id);
  }
}
