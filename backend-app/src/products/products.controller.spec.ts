import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  BadRequestException,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Role } from '../auth/schemas/user.schema';

// Mock data
const mockUser = { id: 'testUserId', role: Role.SELLER };
const mockProduct = {
  _id: 'testProductId',
  name: 'Test Product',
  createdBy: mockUser.id,
};
const mockFile: Express.Multer.File = {
  fieldname: 'image',
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

// Mock the entire ProductsService
const mockProductsService = {
  create: jest.fn().mockResolvedValue(mockProduct),
  findAll: jest.fn().mockResolvedValue([mockProduct]),
  findMyProducts: jest.fn().mockResolvedValue([mockProduct]),
  findOne: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue(mockProduct),
  remove: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  addReview: jest.fn().mockResolvedValue({ ...mockProduct, reviews: ['test'] }),
};

// Mock Guards to allow tests to pass without authentication
const mockAuthenticationGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = mockUser;
    return true;
  },
};

const mockRolesGuard = {
  canActivate: () => true,
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(mockAuthenticationGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      description: 'New Description',
      initialPrice: 150,
      category: 'Test',
      niche: 'Test',
    };

    it('should call productsService.create with correct arguments', async () => {
      await controller.create(createDto, { user: mockUser }, mockFile);
      expect(service.create).toHaveBeenCalledWith(
        createDto,
        mockUser.id,
        mockFile,
      );
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(
        controller.create(createDto, { user: mockUser }, undefined),
      ).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call productsService.findAll with no query params', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should call productsService.findAll with query params', async () => {
      const query = { search: 'test', category: 'electronics' };
      await controller.findAll(query.search, query.category);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findMyProducts', () => {
    it('should call productsService.findMyProducts with the user ID', async () => {
      await controller.findMyProducts({ user: mockUser });
      expect(service.findMyProducts).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with the product ID', async () => {
      const productId = 'testId123';
      await controller.findOne(productId);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated Product' };

    it('should call productsService.update with correct arguments', async () => {
      const productId = 'testId123';
      await controller.update(productId, updateDto, { user: mockUser }, undefined);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        updateDto,
        mockUser.id,
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('should call productsService.remove with correct arguments', async () => {
      const productId = 'testId123';
      await controller.remove(productId, { user: mockUser });
      expect(service.remove).toHaveBeenCalledWith(productId, mockUser.id);
    });
  });

  describe('addReview', () => {
    const reviewDto: CreateReviewDto = {
      rating: 5,
      comment: 'Excellent!',
    };

    it('should call productsService.addReview with correct arguments', async () => {
      const productId = 'testId123';
      await controller.addReview(productId, { user: mockUser }, reviewDto);
      expect(service.addReview).toHaveBeenCalledWith(
        productId,
        mockUser.id,
        reviewDto,
      );
    });
  });
});