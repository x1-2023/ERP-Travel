import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DeductionSourceEnum {
  ERP_AR = 'ERP_AR',
  BANK_LOCKBOX = 'BANK_LOCKBOX',
  EDI_812 = 'EDI_812',
  MANUAL = 'MANUAL',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

export class CreateImportDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ enum: DeductionSourceEnum, description: 'Deduction source' })
  @IsEnum(DeductionSourceEnum)
  source: DeductionSourceEnum;

  @ApiPropertyOptional({ description: 'Import file name' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Import file path' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiProperty({ description: 'Total records in the batch', example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalRecords: number;

  @ApiPropertyOptional({ description: 'Error details (JSON)', type: 'object' })
  @IsOptional()
  errors?: any;
}
