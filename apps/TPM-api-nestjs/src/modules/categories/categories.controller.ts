import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL CATEGORY TYPES
  // GET /api/categories
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all category types',
    description:
      'Get a list of all available category types with their descriptions and value counts',
  })
  @ApiResponse({ status: 200, description: 'List of category types' })
  getAllCategoryTypes() {
    return this.categoriesService.getAllCategoryTypes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CHANNEL ENUM VALUES
  // GET /api/categories/channels
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('channels')
  @ApiOperation({
    summary: 'Get Channel enum values',
    description: 'Get all Channel enum values with labels (MT, GT, ECOMMERCE, HORECA, OTHER)',
  })
  @ApiResponse({ status: 200, description: 'Channel enum values' })
  getChannels() {
    return this.categoriesService.getChannels();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TEMPLATE CATEGORY ENUM VALUES
  // GET /api/categories/templates
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('templates')
  @ApiOperation({
    summary: 'Get TemplateCategory enum values',
    description:
      'Get all TemplateCategory enum values with labels (SEASONAL, DISPLAY, LISTING, REBATE, CUSTOM)',
  })
  @ApiResponse({ status: 200, description: 'TemplateCategory enum values' })
  getTemplates() {
    return this.categoriesService.getTemplates();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET DEDUCTION CATEGORY ENUM VALUES
  // GET /api/categories/deductions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('deductions')
  @ApiOperation({
    summary: 'Get DeductionCategory enum values',
    description:
      'Get all DeductionCategory enum values with labels (TRADE_PROMOTION, PRICING, LOGISTICS, QUALITY, ADVERTISING, OTHER)',
  })
  @ApiResponse({ status: 200, description: 'DeductionCategory enum values' })
  getDeductions() {
    return this.categoriesService.getDeductions();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET FILE CATEGORY ENUM VALUES
  // GET /api/categories/files
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('files')
  @ApiOperation({
    summary: 'Get FileCategory enum values',
    description:
      'Get all FileCategory enum values with labels (POA, POP, INVOICE, CONTRACT, REPORT, OTHER)',
  })
  @ApiResponse({ status: 200, description: 'FileCategory enum values' })
  getFiles() {
    return this.categoriesService.getFiles();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET GL ACCOUNT TYPE ENUM VALUES
  // GET /api/categories/accounts
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('accounts')
  @ApiOperation({
    summary: 'Get GLAccountType enum values',
    description:
      'Get all GLAccountType enum values with labels (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)',
  })
  @ApiResponse({ status: 200, description: 'GLAccountType enum values' })
  getAccounts() {
    return this.categoriesService.getAccounts();
  }
}
