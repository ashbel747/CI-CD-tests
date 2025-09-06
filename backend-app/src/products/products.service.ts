import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../config/cloudinary';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Product> {
    const cloudinaryClient = this.cloudinaryService.getClient();

    // Wrap Cloudinary's upload_stream in a Promise
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinaryClient.uploader.upload_stream(
        { folder: 'products', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.end(file.buffer); // send buffer directly
    });

    const created = new this.productModel({
      ...createProductDto,
      image: uploadResult.secure_url, // store Cloudinary URL
      createdBy: userId,
    });

    return created.save();
  }


  // Existing methods remain unchanged
  async findAll(filters: { search?: string; category?: string; niche?: string }) {
    const query: any = {};
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.category) query.category = { $regex: `^${filters.category}$`, $options: 'i' };
    if (filters.niche) query.niche = { $regex: `^${filters.niche}$`, $options: 'i' };
    return this.productModel.find(query).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    if (product.createdBy !== userId) throw new ForbiddenException('You can only update your own products');

    // If a new image is uploaded, send it to Cloudinary
    if (file) {
      const cloudinaryClient = this.cloudinaryService.getClient();
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinaryClient.uploader.upload_stream(
          { folder: 'products', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      product.image = uploadResult.secure_url; // update image URL
    }

    Object.assign(product, updateProductDto); // update other fields
    return product.save();
  }


  async remove(id: string, userId: string): Promise<DeleteResult> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    if (product.createdBy !== userId) throw new ForbiddenException('You can only delete your own products');
    return this.productModel.deleteOne({ _id: id }).exec();
  }

  async findMyProducts(userId: string): Promise<Product[]> {
    return this.productModel.find({ createdBy: userId }).exec();
  }

  async addReview(productId: string, userId: string, reviewDto: CreateReviewDto) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');

    const review = {
      userId,
      comment: reviewDto.comment,
      rating: reviewDto.rating,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    return product.save();
  }
}
