import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Import JwtService

// A mock implementation of the AuthenticationGuard
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // We can add a mock user object to the request
    request.user = { id: 'mock-user-id' }; 
    return true;
  }
}

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        // Mock the CartService with its methods
        {
          provide: CartService,
          useValue: {
            addToCart: jest.fn(),
            getCart: jest.fn(),
            updateCart: jest.fn(),
            checkout: jest.fn(),
          },
        },
        // Provide a mock for JwtService to resolve the dependency of AuthenticationGuard
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
          },
        },
        // Use a mock class for the AuthenticationGuard to bypass its logic
        {
          provide: AuthenticationGuard,
          useClass: MockAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  // Test 1: Check if the controller and service are defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // Test 2: Verify addToCart method
  it('should call cartService.addToCart with the correct parameters', async () => {
    const userId = 'mock-user-id';
    const dto: AddToCartDto = { productId: 'product-1', quantity: 1 };
    const result = { message: 'Item added successfully' };
    (service.addToCart as jest.Mock).mockResolvedValue(result);

    const req = { user: { id: userId } };
    const response = await controller.addToCart(req, dto);

    expect(service.addToCart).toHaveBeenCalledWith(userId, dto);
    expect(response).toBe(result);
  });

  // Test 3: Verify getCart method
  it('should call cartService.getCart with the correct user id', async () => {
    const userId = 'mock-user-id';
    const result = [{ productId: 'product-1', quantity: 2 }];
    (service.getCart as jest.Mock).mockResolvedValue(result);

    const req = { user: { id: userId } };
    const response = await controller.getCart(req);

    expect(service.getCart).toHaveBeenCalledWith(userId);
    expect(response).toBe(result);
  });

  // Test 4: Verify updateCart method
  it('should call cartService.updateCart with the correct parameters', async () => {
    const userId = 'mock-user-id';
    const dto: UpdateCartDto = { productId: 'product-1', quantity: 5 };
    const result = { message: 'Item updated successfully' };
    (service.updateCart as jest.Mock).mockResolvedValue(result);

    const req = { user: { id: userId } };
    const response = await controller.updateCart(req, dto);

    expect(service.updateCart).toHaveBeenCalledWith(userId, dto);
    expect(response).toBe(result);
  });

  // Test 5: Verify checkout method
  it('should call cartService.checkout with the correct user id', async () => {
    const userId = 'mock-user-id';
    const result = { message: 'Checkout successful, cart cleared' };
    (service.checkout as jest.Mock).mockResolvedValue(result);

    const req = { user: { id: userId } };
    const response = await controller.checkout(req);

    expect(service.checkout).toHaveBeenCalledWith(userId);
    expect(response).toBe(result);
  });
});
