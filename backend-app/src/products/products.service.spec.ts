import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { CloudinaryService } from '../config/cloudinary';
import { Product } from './entities/product.entity';
import { User } from '../auth/schemas/user.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductModel = {
    find: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockCloudinaryService = {
    getClient: jest.fn().mockReturnValue({
      uploader: {
        upload_stream: jest.fn().mockImplementation((options, cb) => {
          return {
            end: () => cb(null, { secure_url: 'http://mock-image-url.com' }),
          };
        }),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns a product if found', async () => {
      const mockProduct = { _id: '1', name: 'Test Product' };
      mockProductModel.findById.mockReturnValue({ exec: () => mockProduct });

      expect(await service.findOne('1')).toEqual(mockProduct);
    });

    it('throws NotFoundException if product missing', async () => {
      mockProductModel.findById.mockReturnValue({ exec: () => null });
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException if user is not owner', async () => {
      mockProductModel.findById.mockReturnValue({ exec: () => ({ createdBy: 'abc' }) });
      await expect(service.remove('1', 'otherUser')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addReview', () => {
    it('adds review correctly', async () => {
      const mockProduct = { reviews: [], save: jest.fn().mockResolvedValue(true) };
      const mockUser = { name: 'John Doe' };
      mockProductModel.findById.mockReturnValue({ exec: () => mockProduct });
      mockUserModel.findById.mockReturnValue({ exec: () => mockUser });

      const result = await service.addReview('p1', 'u1', { comment: 'Nice', rating: 5 });

      expect(mockProduct.reviews.length).toBe(1);
      expect(result).toBe(true);
    });
  });
});
