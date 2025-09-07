// src/cart/cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async addToCart(userId: string, dto: AddToCartDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === dto.productId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity || 1;
    } else {
      user.cart.push({ productId: dto.productId, quantity: dto.quantity || 1 });
    }

    await user.save();

    // Re-fetch the user and populate the cart to return consistent data
    const updatedUser = await this.userModel
      .findById(userId)
      .populate('cart.productId')
      .exec();
    return updatedUser.cart;
  }

  async getCart(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('cart.productId') // populate product details
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.cart;
  }

  async updateCart(userId: string, dto: UpdateCartDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const itemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === dto.productId,
    );

    if (itemIndex === -1) throw new NotFoundException('Item not in cart');

    if (dto.quantity <= 0) {
      // remove item
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = dto.quantity;
    }

    await user.save();

    // Re-fetch the user and populate the cart to return consistent data
    const updatedUser = await this.userModel
      .findById(userId)
      .populate('cart.productId')
      .exec();
    return updatedUser.cart;
  }

  async checkout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // For MVP: just clear cart
    user.cart = [];
    await user.save();

    return { message: 'Checkout successful, cart cleared' };
  }
}
