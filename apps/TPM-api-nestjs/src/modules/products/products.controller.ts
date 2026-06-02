import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PRODUCTS
  // GET /api/products
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all products',
    description: 'Get paginated list of products with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Product list with pagination' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET DISTINCT CATEGORIES
  // GET /api/products/categories
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('categories')
  @ApiOperation({
    summary: 'Get product categories',
    description: 'Get list of all distinct product categories',
  })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET DISTINCT BRANDS
  // GET /api/products/brands
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('brands')
  @ApiOperation({
    summary: 'Get product brands',
    description: 'Get list of all distinct product brands',
  })
  @ApiResponse({ status: 200, description: 'List of brands' })
  async getBrands() {
    return this.productsService.getBrands();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE PRODUCT
  // GET /api/products/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Get detailed product information including company and relation counts',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE PRODUCT
  // POST /api/products
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 409,
    description: 'Product with same SKU already exists for this company',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE PRODUCT
  // PUT /api/products/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a product',
    description: 'Update product details. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE (DEACTIVATE) PRODUCT
  // DELETE /api/products/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate a product',
    description: 'Soft delete a product by setting isActive to false. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Product has active tactic items' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
