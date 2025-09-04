import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Permissions } from 'src/decorators/decorator';
import { Resource } from 'src/roles/enums/resource.enum';
import { Action } from 'src/roles/enums/action.enum';

@Controller('test')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class TestController {
  // Route accessible by both buyers and sellers (read products)
  @Get('products')
  @Permissions([{ resource: Resource.products, actions: [Action.read] }])
  getProducts() {
    return {
      message: 'Products retrieved successfully',
      data: ['Product 1', 'Product 2', 'Product 3'],
      permission: 'products:read',
    };
  }

  // Route accessible only by sellers (create products)
  @Post('products')
  @Permissions([{ resource: Resource.products, actions: [Action.create] }])
  createProduct(@Body() productData: any) {
    return {
      message: 'Product created successfully',
      data: { id: 1, ...productData },
      permission: 'products:create',
    };
  }

  // Route accessible only by sellers (manage listings)
  @Get('listings')
  @Permissions([{ resource: Resource.listings, actions: [Action.read] }])
  getListings() {
    return {
      message: 'Listings retrieved successfully',
      data: ['Listing 1', 'Listing 2'],
      permission: 'listings:read',
    };
  }

  // Route accessible by both buyers and sellers (read orders)
  @Get('orders')
  @Permissions([{ resource: Resource.orders, actions: [Action.read] }])
  getOrders() {
    return {
      message: 'Orders retrieved successfully',
      data: ['Order 1', 'Order 2'],
      permission: 'orders:read',
    };
  }

  // Route accessible only by buyers (create orders)
  @Post('orders')
  @Permissions([{ resource: Resource.orders, actions: [Action.create] }])
  createOrder(@Body() orderData: any) {
    return {
      message: 'Order created successfully',
      data: { id: 1, ...orderData },
      permission: 'orders:create',
    };
  }

  // Route accessible only by sellers (read users)
  @Get('users')
  @Permissions([{ resource: Resource.users, actions: [Action.read] }])
  getUsers() {
    return {
      message: 'Users retrieved successfully',
      data: ['User 1', 'User 2'],
      permission: 'users:read',
    };
  }
}
