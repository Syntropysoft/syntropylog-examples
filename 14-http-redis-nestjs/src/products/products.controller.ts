import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService, Product } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    const product = await this.productsService.getProduct(id);

    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  @Post()
  async createProduct(
    @Body() productData: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.productsService.createProduct(productData);
  }
}
