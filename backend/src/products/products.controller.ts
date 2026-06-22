import { Body, Controller, Post } from '@nestjs/common';
import { Param, Get, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    example: '2736ba17-4f5f-4b7f-9ccf-eab127791384',
  })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'stock', required: false, example: 'gt:0' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }
}
