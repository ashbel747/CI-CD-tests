import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let userModel: Model<UserDocument>;
  let productModel: Model<ProductDocument>;

  const mockProduct = { _id: 'mock-product-id', name: 'Test Product', initialPrice: 100 };
  const mockUser = {
    _id: 'mock-user-id',
    cart: [],
    save: jest.fn(),
  };

  const mockExec = jest.fn();
  const mockPopulate = jest.fn(() => ({ exec: mockExec }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(() => ({
              populate: mockPopulate,
              exec: mockExec,
            })),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    productModel = module.get<Model<ProductDocument>>(getModelToken(Product.name));
  });

  // Reset mocks before each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add a new item to the cart and save the user', async () => {
      // Setup
      mockUser.cart = [];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(productModel, 'findById').mockResolvedValue(mockProduct);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);
      mockExec.mockResolvedValueOnce({ ...mockUser, cart: [{ productId: mockProduct, quantity: 1 }] });

      const dto = { productId: mockProduct._id, quantity: 1 };
      
      // Execute
      const result = await service.addToCart(mockUser._id, dto);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(productModel.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(mockUser.cart).toHaveLength(1);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should increase the quantity of an existing item in the cart', async () => {
      // Setup
      mockUser.cart = [{ productId: mockProduct._id as any, quantity: 2 }];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(productModel, 'findById').mockResolvedValue(mockProduct);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);
      mockExec.mockResolvedValueOnce({ ...mockUser, cart: [{ productId: mockProduct, quantity: 3 }] });

      const dto = { productId: mockProduct._id, quantity: 1 };

      // Execute
      await service.addToCart(mockUser._id, dto);

      // Assert
      expect(mockUser.cart[0].quantity).toBe(3);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Setup
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);
      const dto = { productId: mockProduct._id, quantity: 1 };

      // Execute & Assert
      await expect(service.addToCart(mockUser._id, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Setup
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(productModel, 'findById').mockResolvedValue(null);
      const dto = { productId: 'non-existent-product', quantity: 1 };

      // Execute & Assert
      await expect(service.addToCart(mockUser._id, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCart', () => {
    it('should return the user cart with populated products', async () => {
      // Setup
      const populatedCart = [{ productId: mockProduct, quantity: 1 }];
      const mockUserWithCart = { ...mockUser, cart: populatedCart };
      jest.spyOn(userModel, 'findById').mockReturnValue({ populate: mockPopulate });
      mockExec.mockResolvedValue(mockUserWithCart);

      // Execute
      const result = await service.getCart(mockUser._id);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(mockPopulate).toHaveBeenCalledWith('cart.productId');
      expect(result).toBe(populatedCart);
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Setup - Mock the chain to return null after populate and exec
      jest.spyOn(userModel, 'findById').mockReturnValue({ 
        populate: mockPopulate 
      } as any);
      mockExec.mockResolvedValue(null); // This simulates user not found after the full chain

      // Execute & Assert
      await expect(service.getCart(mockUser._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCart', () => {
    const existingCart = [{ productId: mockProduct._id as any, quantity: 5 }];

    it('should update the quantity of an item in the cart', async () => {
      // Setup
      mockUser.cart = [...existingCart];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);
      mockExec.mockResolvedValueOnce({ ...mockUser, cart: [{ productId: mockProduct, quantity: 10 }] });

      const dto = { productId: mockProduct._id, quantity: 10 };

      // Execute
      await service.updateCart(mockUser._id, dto);

      // Assert
      expect(mockUser.cart[0].quantity).toBe(10);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should remove an item if the quantity is 0 or less', async () => {
      // Setup
      mockUser.cart = [...existingCart];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);
      mockExec.mockResolvedValueOnce({ ...mockUser, cart: [] });
      
      const dto = { productId: mockProduct._id, quantity: 0 };

      // Execute
      await service.updateCart(mockUser._id, dto);

      // Assert
      expect(mockUser.cart).toHaveLength(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Setup
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);
      const dto = { productId: mockProduct._id, quantity: 1 };

      // Execute & Assert
      await expect(service.updateCart(mockUser._id, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if item is not in the cart', async () => {
      // Setup
      mockUser.cart = [];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      const dto = { productId: 'non-existent-item', quantity: 1 };

      // Execute & Assert
      await expect(service.updateCart(mockUser._id, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkout', () => {
    it('should clear the cart and save the user', async () => {
      // Setup
      mockUser.cart = [{ productId: mockProduct._id as any, quantity: 1 }];
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);

      // Execute
      const result = await service.checkout(mockUser._id);

      // Assert
      expect(mockUser.cart).toHaveLength(0);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Checkout successful, cart cleared' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Setup
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      // Execute & Assert
      await expect(service.checkout(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});