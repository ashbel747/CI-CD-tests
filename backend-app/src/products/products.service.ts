import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, userId:string): Promise<Product> {
    const created = new this.productModel({
      ...createProductDto,
      createdBy: userId,
    });
    return created.save();
  }

  async findAll(filters: { search?: string; category?: string; niche?: string }) {
    const query: any = {};

    if (filters.search) {
      // Match on name OR description (case-insensitive)
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.category) {
      query.category = { $regex: `^${filters.category}$`, $options: 'i' };
    }

    if (filters.niche) {
      query.niche = { $regex: `^${filters.niche}$`, $options: 'i' };
    }

    return this.productModel.find(query).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');

    if (product.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string, userId: string): Promise<DeleteResult> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');

    if (product.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return this.productModel.deleteOne({ _id: id }).exec();
  }

  async findMyProducts(userId: string): Promise<Product[]> {
    return this.productModel.find({ createdBy: userId }).exec();
  }
}
