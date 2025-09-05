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
} from '@nestjs/common';
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
  async create(@Body() dto: CreateProductDto, @Req() req) {
    return this.productsService.create(dto, req.user.id);
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
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req) {
    return this.productsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard, new RolesGuard('seller'))
  async remove(@Param('id') id: string, @Req() req) {
    return this.productsService.remove(id, req.user.id);
  }
}
