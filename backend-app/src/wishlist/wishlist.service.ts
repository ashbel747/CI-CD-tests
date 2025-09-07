import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class WishlistService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getWishlist(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('wishlist') // Populate the wishlist with product details
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.wishlist;
  }

  async toggleWishlist(userId: string, productId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productIdObj = new Types.ObjectId(productId);
    const itemIndex = user.wishlist.findIndex((item) =>
      item.equals(productIdObj),
    );

    if (itemIndex !== -1) {
      // Product is already in wishlist, so remove it
      user.wishlist.splice(itemIndex, 1);
    } else {
      // Product is not in wishlist, so add it
      user.wishlist.push(productIdObj);
    }

    await user.save();

    // Re-fetch and populate to return the updated wishlist
    const updatedUser = await this.userModel
      .findById(userId)
      .populate('wishlist')
      .exec();

    return updatedUser.wishlist;
  }
}
