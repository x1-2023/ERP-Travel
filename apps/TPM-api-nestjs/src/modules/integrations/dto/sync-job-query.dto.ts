import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum SyncStatusFilter {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export class SyncJobQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by connection ID' })
  @IsOptional()
  @IsString()
  connectionId?: string;

  @ApiPropertyOptional({ enum: SyncStatusFilter, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(SyncStatusFilter)
  status?: SyncStatusFilter;

  @ApiPropertyOptional({ description: 'Filter by config ID' })
  @IsOptional()
  @IsString()
  configId?: string;
}
