import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum FileCategoryFilter {
  POA = 'POA',
  POP = 'POP',
  INVOICE = 'INVOICE',
  CONTRACT = 'CONTRACT',
  REPORT = 'REPORT',
  OTHER = 'OTHER',
}

export class FileQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FileCategoryFilter, description: 'Filter by file category' })
  @IsOptional()
  @IsEnum(FileCategoryFilter)
  category?: FileCategoryFilter;

  @ApiPropertyOptional({ example: 'user_abc123', description: 'Filter by uploader user ID' })
  @IsOptional()
  @IsString()
  uploadedById?: string;

  @ApiPropertyOptional({ description: 'Filter files from this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter files up to this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
