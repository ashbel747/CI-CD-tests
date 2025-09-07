import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('wishlist')
@UseGuards(AuthenticationGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  toggleWishlist(@Req() req, @Param('productId') productId: string) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }
}
