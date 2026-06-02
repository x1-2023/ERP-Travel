import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { FileQueryDto } from './dto/file-query.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { CreatePoaDto } from './dto/create-poa.dto';
import { CreatePopDto } from './dto/create-pop.dto';
import { RejectReasonDto } from './dto/reject-reason.dto';
import { PoaQueryDto } from './dto/poa-query.dto';
import { PopQueryDto } from './dto/pop-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST FILES
  // GET /api/documents
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all files',
    description:
      'Get paginated list of files with optional filtering by category, uploader, and date range',
  })
  @ApiResponse({ status: 200, description: 'File list with pagination' })
  async findAll(@Query() query: FileQueryDto) {
    return this.documentsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE SUMMARY
  // GET /api/documents/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get file summary statistics',
    description: 'Get aggregated statistics by file category',
  })
  @ApiResponse({ status: 200, description: 'File summary statistics' })
  async getSummary() {
    return this.documentsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST POAs
  // GET /api/documents/poa
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('poa')
  @ApiOperation({
    summary: 'List Proof of Activity records',
    description: 'Get paginated list of POAs with optional filtering by status and promotion',
  })
  @ApiResponse({ status: 200, description: 'POA list with pagination' })
  async listPoas(@Query() query: PoaQueryDto) {
    return this.documentsService.listPoas(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE POA
  // POST /api/documents/poa
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('poa')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a POA (Proof of Activity)',
    description:
      'Link a file to a promotion as Proof of Activity. Requires ADMIN, MANAGER, or KAM role.',
  })
  @ApiResponse({ status: 201, description: 'POA created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createPoa(@Body() dto: CreatePoaDto) {
    return this.documentsService.createPoa(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE POA
  // POST /api/documents/poa/:id/approve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('poa/:id/approve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a POA',
    description: 'Approve a PENDING POA. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'POA ID' })
  @ApiResponse({ status: 200, description: 'POA approved successfully' })
  @ApiResponse({ status: 400, description: 'POA is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'POA not found' })
  async approvePoa(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.approvePoa(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT POA
  // POST /api/documents/poa/:id/reject
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('poa/:id/reject')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a POA',
    description: 'Reject a PENDING POA. Requires a reason. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'POA ID' })
  @ApiResponse({ status: 200, description: 'POA rejected successfully' })
  @ApiResponse({ status: 400, description: 'POA is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'POA not found' })
  async rejectPoa(
    @Param('id') id: string,
    @Body() dto: RejectReasonDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.rejectPoa(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST POPs
  // GET /api/documents/pop
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('pop')
  @ApiOperation({
    summary: 'List Proof of Performance records',
    description: 'Get paginated list of POPs with optional filtering by status and claim',
  })
  @ApiResponse({ status: 200, description: 'POP list with pagination' })
  async listPops(@Query() query: PopQueryDto) {
    return this.documentsService.listPops(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE POP
  // POST /api/documents/pop
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('pop')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a POP (Proof of Performance)',
    description:
      'Link a file to a claim as Proof of Performance. Requires ADMIN, MANAGER, or KAM role.',
  })
  @ApiResponse({ status: 201, description: 'POP created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createPop(@Body() dto: CreatePopDto) {
    return this.documentsService.createPop(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFY POP
  // POST /api/documents/pop/:id/verify
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('pop/:id/verify')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a POP',
    description: 'Verify a PENDING POP. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'POP ID' })
  @ApiResponse({ status: 200, description: 'POP verified successfully' })
  @ApiResponse({ status: 400, description: 'POP is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'POP not found' })
  async verifyPop(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.documentsService.verifyPop(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT POP
  // POST /api/documents/pop/:id/reject
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('pop/:id/reject')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a POP',
    description: 'Reject a PENDING POP. Requires a reason. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'POP ID' })
  @ApiResponse({ status: 200, description: 'POP rejected successfully' })
  @ApiResponse({ status: 400, description: 'POP is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'POP not found' })
  async rejectPop(
    @Param('id') id: string,
    @Body() dto: RejectReasonDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.rejectPop(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE FILE
  // GET /api/documents/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get file by ID',
    description: 'Get detailed file information including POA and POP associations',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File details' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTER FILE METADATA
  // POST /api/documents
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register file metadata',
    description: 'Register file metadata (simulated upload - no actual S3 interaction)',
  })
  @ApiResponse({ status: 201, description: 'File metadata registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateFileDto, @CurrentUser('id') userId: string) {
    return this.documentsService.create(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE FILE
  // DELETE /api/documents/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete file metadata',
    description:
      'Delete file metadata. Cannot delete files linked to POA or POP. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'File is linked to POA or POP' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
