import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST CUSTOMERS
  // GET /api/customers
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all customers',
    description:
      'Get paginated list of customers with optional filtering by channel, active status, and search',
  })
  @ApiResponse({ status: 200, description: 'Customer list with pagination' })
  async findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE CUSTOMER
  // GET /api/customers/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Get detailed customer information including recent promotions and claims',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer details with related data' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE CUSTOMER
  // POST /api/customers
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new customer',
    description:
      'Create a new customer. Requires ADMIN or MANAGER role. Code must be unique within the company.',
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or company not found' })
  @ApiResponse({ status: 409, description: 'Customer code already exists in this company' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CUSTOMER
  // PUT /api/customers/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a customer',
    description: 'Update customer details. Code and companyId cannot be changed.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer name already exists in this company' })
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE (DEACTIVATE) CUSTOMER
  // DELETE /api/customers/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate a customer (soft delete)',
    description:
      'Sets customer isActive to false. Cannot deactivate if customer has active promotions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Customer has active promotions' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE CUSTOMER ACTIVE STATUS
  // PATCH /api/customers/:id/toggle-active
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch(':id/toggle-active')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Toggle customer active status',
    description: 'Flip the isActive flag. Cannot deactivate if customer has active promotions.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer active status toggled' })
  @ApiResponse({ status: 400, description: 'Customer has active promotions (cannot deactivate)' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async toggleActive(@Param('id') id: string) {
    return this.customersService.toggleActive(id);
  }
}
