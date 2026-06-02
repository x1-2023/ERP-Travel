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
import { UsersService } from './users.service';
import { CreateUserDto, RoleEnum } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST USERS
  // GET /api/users
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'List all users',
    description:
      'Get paginated list of users with optional filtering and sorting. Requires ADMIN role.',
  })
  @ApiResponse({ status: 200, description: 'User list with pagination' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CURRENT USER PROFILE
  // GET /api/users/me
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the profile of the currently authenticated user. Available to any role.',
  })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE USER
  // GET /api/users/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Get detailed user information including company and counts. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN or MANAGER role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE USER
  // POST /api/users
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user with hashed password. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE USER
  // PUT /api/users/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Update user details. Password will be re-hashed if provided. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE (DEACTIVATE) USER
  // DELETE /api/users/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate a user',
    description: 'Soft delete a user by setting isActive to false. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 400, description: 'User is already deactivated' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGE ROLE
  // PATCH /api/users/:id/role
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch(':id/role')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Change user role',
    description: 'Update the role of a user. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid role' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeRole(@Param('id') id: string, @Body('role') role: RoleEnum) {
    return this.usersService.changeRole(id, role);
  }
}
