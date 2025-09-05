import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthenticationGuard, new RolesGuard('seller'))
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateProductDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Debug logs
      console.log('Received body:', dto); // check all text fields
    console.log('Received file:', file);   // check if Multer captured the file
    console.log('User ID:', req.user.id);  // confirm authenticated user

    if (!file) {
      throw new BadRequestException('Product image is required');
    }

    return this.productsService.create(dto, req.user.id, file);
  }


  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('niche') niche?: string,
  ) {
    return this.productsService.findAll({ search, category, niche });
  }

  @Get('me')
  @UseGuards(AuthenticationGuard, new RolesGuard('seller'))
  async findMyProducts(@Req() req) {
    return this.productsService.findMyProducts(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthenticationGuard, new RolesGuard('seller'))
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.update(id, dto, req.user.id, file);
  }


  @Delete(':id')
  @UseGuards(AuthenticationGuard, new RolesGuard('seller'))
  async remove(@Param('id') id: string, @Req() req) {
    return this.productsService.remove(id, req.user.id);
  }
}
