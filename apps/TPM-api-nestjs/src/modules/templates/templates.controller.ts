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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Templates')
@ApiBearerAuth('JWT-auth')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST TEMPLATES
  // GET /api/templates
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all templates',
    description:
      'Get paginated list of promotion templates with optional filtering by category, visibility, and search',
  })
  @ApiResponse({ status: 200, description: 'Template list with pagination' })
  async findAll(@Query() query: TemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TEMPLATE CATEGORIES
  // GET /api/templates/categories
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('categories')
  @ApiOperation({
    summary: 'List all template categories',
    description: 'Returns the available TemplateCategory enum values',
  })
  @ApiResponse({ status: 200, description: 'List of template categories' })
  async getCategories() {
    return this.templatesService.getCategories();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TEMPLATES BY CATEGORY
  // GET /api/templates/category/:category
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('category/:category')
  @ApiOperation({
    summary: 'Get templates by category',
    description: 'Get all templates in a specific category',
  })
  @ApiParam({
    name: 'category',
    description: 'Template category (SEASONAL, DISPLAY, LISTING, REBATE, CUSTOM)',
  })
  @ApiResponse({ status: 200, description: 'Templates in the given category' })
  async findByCategory(@Param('category') category: string) {
    return this.templatesService.findByCategory(category);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE TEMPLATE
  // GET /api/templates/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get template by ID',
    description: 'Get detailed template information including version history',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template details with versions' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TEMPLATE
  // POST /api/templates
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new template',
    description: 'Create a new promotion template. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or company not found' })
  async create(@Body() createTemplateDto: CreateTemplateDto, @CurrentUser('id') userId: string) {
    return this.templatesService.create(createTemplateDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE TEMPLATE
  // PUT /api/templates/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a template',
    description:
      'Update template details. If template JSON changes, a new version is created. companyId cannot be changed.',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.update(id, updateTemplateDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE TEMPLATE
  // DELETE /api/templates/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a template',
    description: 'Permanently delete a template and all its versions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DUPLICATE TEMPLATE
  // POST /api/templates/:id/duplicate
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/duplicate')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Duplicate a template',
    description:
      'Create a copy of an existing template with "(Copy)" appended to the name. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Template ID to duplicate' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Source template not found' })
  async duplicate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.templatesService.duplicate(id, userId);
  }
}
