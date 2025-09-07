import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { RolesGuard } from '../guards/role.guard';

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  addReview: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: () => true }) // ✅ mock auth guard
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // ✅ mock roles guard
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should call service.create on create()', async () => {
    const dto = { name: 'Test Product', description: 'desc' } as any;
    const mockResult = { _id: '1', ...dto };
    mockProductsService.create.mockResolvedValue(mockResult);

    const req = { user: { id: '123' } };
    const file = { buffer: Buffer.from('test') } as Express.Multer.File;

    const result = await controller.create(dto, req, file);
    expect(service.create).toHaveBeenCalledWith(dto, '123', file);
    expect(result._id).toBe('1');
  });

  it('should return products from findAll()', async () => {
    const mockProducts = [{ _id: '1', name: 'Test' }];
    mockProductsService.findAll.mockResolvedValue(mockProducts);

    const result = await controller.findAll();
    expect(result).toEqual(mockProducts);
  });

  it('should delegate to addReview()', async () => {
    const dto = { comment: 'Nice', rating: 5 };
    const mockResult = { _id: '1', reviews: [dto] };
    mockProductsService.addReview.mockResolvedValue(mockResult);

    const req = { user: { id: '123' } };
    const result = await controller.addReview('1', req, dto);
    expect(service.addReview).toHaveBeenCalledWith('1', '123', dto);
    expect(result).toEqual(mockResult);
  });
});
