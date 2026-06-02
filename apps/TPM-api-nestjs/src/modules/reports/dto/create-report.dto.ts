import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportFormatEnum {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum ReportFrequencyEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ON_DEMAND = 'ON_DEMAND',
}

export class CreateReportDto {
  @ApiProperty({ example: 'Monthly Promotion Performance', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Summarizes promotion performance metrics by month' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Performance' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 'promotions', description: 'Data source table/entity name' })
  @IsString()
  dataSource: string;

  @ApiProperty({
    example: [
      { field: 'name', label: 'Promotion Name' },
      { field: 'budget', label: 'Budget' },
    ],
    description: 'Column definitions as JSON',
  })
  @IsObject()
  columns: Record<string, any>;

  @ApiPropertyOptional({
    example: { status: 'ACTIVE', startDate: { gte: '2024-01-01' } },
    description: 'Filter criteria as JSON',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['category', 'status'],
    description: 'Fields to group results by',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({
    example: { field: 'createdAt', order: 'desc' },
    description: 'Sort configuration as JSON',
  })
  @IsOptional()
  @IsObject()
  sortBy?: Record<string, any>;

  @ApiPropertyOptional({
    example: { totalBudget: { type: 'sum', field: 'budget' } },
    description: 'Calculation definitions as JSON',
  })
  @IsOptional()
  @IsObject()
  calculations?: Record<string, any>;

  @ApiPropertyOptional({ enum: ReportFormatEnum, default: 'EXCEL' })
  @IsOptional()
  @IsEnum(ReportFormatEnum)
  defaultFormat?: ReportFormatEnum;

  @ApiPropertyOptional({
    default: false,
    description: 'Whether this report is a reusable template',
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({ example: 'cuid_company_id', description: 'Company ID' })
  @IsString()
  companyId: string;
}
