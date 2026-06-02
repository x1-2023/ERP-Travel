import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ApprovalStatusFilter {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_NEEDED = 'REVISION_NEEDED',
}

export class ApprovalQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ApprovalStatusFilter, description: 'Filter by approval status' })
  @IsOptional()
  @IsEnum(ApprovalStatusFilter)
  status?: ApprovalStatusFilter;

  @ApiPropertyOptional({ description: 'Filter by budget ID' })
  @IsOptional()
  @IsString()
  budgetId?: string;

  @ApiPropertyOptional({ description: 'Filter by reviewer ID' })
  @IsOptional()
  @IsString()
  reviewerId?: string;

  @ApiPropertyOptional({ description: 'Filter by approval level', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  level?: number;
}
