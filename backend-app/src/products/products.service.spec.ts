import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query, DeleteResult } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { CloudinaryService } from '../config/cloudinary';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';

// Mock data
const mockProduct = {
  _id: '60c72b2f9b1e8a001c8a4b2c',
  name: 'Test Product',
  description: 'Test description',
  initialPrice: 100,
  category: 'Test',
  niche: 'Test',
  image: 'http://test.com/image.jpg',
  createdBy: 'user123',
  reviews: [],
  save: jest.fn().mockResolvedValue(true),
};

const mockUser = {
  _id: 'user123',
  name: 'Test User',
};

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('test'),
  stream: null,
  destination: '',
  filename: '',
  path: '',
};

// Mock Mongoose model constructor
const MockProductModel = jest.fn().mockImplementation((dto) => ({
  ...dto,
  _id: '60c72b2f9b1e8a001c8a4b2c',
  reviews: [],
  save: jest.fn().mockResolvedValue({
    ...mockProduct,
    ...dto,
    createdBy: 'user123',
  }),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: Model<ProductDocument>;
  let userModel: Model<UserDocument>;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: Object.assign(MockProductModel, {
            find: jest.fn(() => ({ exec: jest.fn().mockResolvedValue([mockProduct]) })),
            findById: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(mockProduct) })),
            deleteOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) })),
          }),
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(mockUser) })),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            getClient: jest.fn(() => ({
              uploader: {
                upload_stream: jest.fn(),
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<Model<ProductDocument>>(getModelToken(Product.name));
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        initialPrice: 200,
        category: 'New Category',
        niche: 'New Niche',
      };

      // Mock the Cloudinary upload to resolve with a secure URL
      const mockUploadStream = {
        end: jest.fn(),
      };
      
      const uploadStreamMock = jest.spyOn(cloudinaryService.getClient().uploader, 'upload_stream')
        .mockImplementation((options, callback) => {
          // Simulate successful upload by calling the callback
          callback(null, { secure_url: 'http://new-test.com/new-image.jpg' });
          return mockUploadStream;
        });

      const result = await service.create(createDto, 'user123', mockFile);

      expect(result.name).toBe('New Product');
      expect(result.initialPrice).toBe(200);
      expect(result.image).toBe('http://new-test.com/new-image.jpg');
      
      // Verify Cloudinary was called correctly
      expect(uploadStreamMock).toHaveBeenCalledWith(
        { folder: 'products', resource_type: 'image' },
        expect.any(Function)
      );
      expect(mockUploadStream.end).toHaveBeenCalledWith(mockFile.buffer);
      
      // Verify the product model was created with correct data
      expect(MockProductModel).toHaveBeenCalledWith({
        ...createDto,
        image: 'http://new-test.com/new-image.jpg',
        createdBy: 'user123',
      });
    });
  });

  describe('findAll', () => {
    it('should return all products with no filters', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockProduct]);
      expect(productModel.find).toHaveBeenCalledWith({});
    });

    it('should filter products by search query', async () => {
      await service.findAll({ search: 'Test' });
      expect(productModel.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Test', $options: 'i' } },
          { description: { $regex: 'Test', $options: 'i' } },
        ],
      });
    });

    it('should filter products by category', async () => {
      await service.findAll({ category: 'Category' });
      expect(productModel.find).toHaveBeenCalledWith({
        category: { $regex: '^Category$', $options: 'i' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const result = await service.findOne('60c72b2f9b1e8a001c8a4b2c');
      expect(result).toEqual(mockProduct);
      expect(productModel.findById).toHaveBeenCalledWith('60c72b2f9b1e8a001c8a4b2c');
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a product if user is the creator', async () => {
      const productToUpdate = {
        ...mockProduct,
        createdBy: 'user123',
        save: jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated Name' }),
      };
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(productToUpdate),
      } as any);

      const updateDto: UpdateProductDto = { name: 'Updated Name' };
      const result = await service.update('60c72b2f9b1e8a001c8a4b2c', updateDto, 'user123');

      expect(result.name).toBe('Updated Name');
      expect(productToUpdate.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(
        service.update('non-existent-id', {}, 'user123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const productCreatedByAnotherUser = {
        ...mockProduct,
        createdBy: 'another-user',
      };
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(productCreatedByAnotherUser),
      } as any);
      await expect(
        service.update('60c72b2f9b1e8a001c8a4b2c', {}, 'user123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a product if user is the creator', async () => {
      const productToRemove = {
        ...mockProduct,
        createdBy: 'user123',
      };
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(productToRemove),
      } as any);

      const result = await service.remove('60c72b2f9b1e8a001c8a4b2c', 'user123');
      expect(result).toEqual({ deletedCount: 1 });
      expect(productModel.deleteOne).toHaveBeenCalledWith({ _id: '60c72b2f9b1e8a001c8a4b2c' });
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(service.remove('non-existent-id', 'user123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ ...mockProduct, createdBy: 'another-user' }),
      } as any);

      await expect(
        service.remove('60c72b2f9b1e8a001c8a4b2c', 'user123'),
      ).rejects.toThrow(ForbiddenException);

      expect(productModel.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('findMyProducts', () => {
    it('should return products created by the specified user', async () => {
      const result = await service.findMyProducts('user123');
      expect(result).toEqual([mockProduct]);
      expect(productModel.find).toHaveBeenCalledWith({ createdBy: 'user123' });
    });
  });

  describe('addReview', () => {
    it('should add a review to a product and save it', async () => {
      const productWithReviews = {
        ...mockProduct,
        reviews: [],
        save: jest.fn().mockResolvedValue({
          ...mockProduct,
          reviews: [{ comment: 'Great product!', rating: 5, name: 'Test User' }],
        }),
      };
      const userToReview = { ...mockUser };

      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(productWithReviews),
      } as any);
      jest.spyOn(userModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(userToReview),
      } as any);

      const reviewDto: CreateReviewDto = { comment: 'Great product!', rating: 5 };
      const result = await service.addReview('60c72b2f9b1e8a001c8a4b2c', 'user123', reviewDto);

      expect(result.reviews.length).toBe(1);
      expect(result.reviews[0].comment).toBe('Great product!');
      expect(result.reviews[0].rating).toBe(5);
      expect(result.reviews[0].name).toBe('Test User');
      expect(productWithReviews.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(
        service.addReview('non-existent-id', 'user123', { comment: '', rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);
      jest.spyOn(userModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(
        service.addReview('60c72b2f9b1e8a001c8a4b2c', 'non-existent-user', {
          comment: '',
          rating: 5,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});