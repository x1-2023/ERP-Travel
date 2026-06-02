import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DeductionSourceEnum {
  ERP_AR = 'ERP_AR',
  BANK_LOCKBOX = 'BANK_LOCKBOX',
  EDI_812 = 'EDI_812',
  MANUAL = 'MANUAL',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

export enum DeductionCategoryEnum {
  TRADE_PROMOTION = 'TRADE_PROMOTION',
  PRICING = 'PRICING',
  LOGISTICS = 'LOGISTICS',
  QUALITY = 'QUALITY',
  ADVERTISING = 'ADVERTISING',
  OTHER = 'OTHER',
}

export class CreateDeductionDto {
  @ApiProperty({ example: 'DED-2024-0001', description: 'Deduction number' })
  @IsString()
  @MaxLength(100)
  deductionNumber: string;

  @ApiPropertyOptional({ example: 'EXT-REF-001', description: 'External reference' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  externalRef?: string;

  @ApiProperty({ enum: DeductionSourceEnum, description: 'Source of the deduction' })
  @IsEnum(DeductionSourceEnum)
  source: DeductionSourceEnum;

  @ApiPropertyOptional({ description: 'Source document reference' })
  @IsOptional()
  @IsString()
  sourceDocument?: string;

  @ApiPropertyOptional({ description: 'Source document date' })
  @IsOptional()
  @IsDateString()
  sourceDate?: string;

  @ApiProperty({ example: 'cust_abc123', description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'comp_abc123', description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 50000, description: 'Deduction amount', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiPropertyOptional({ example: 'VND', description: 'Currency code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ example: '2024-06-15', description: 'Deduction date' })
  @IsDateString()
  deductionDate: string;

  @ApiPropertyOptional({ example: '2024-07-15', description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: '2024-06-10', description: 'Received date' })
  @IsDateString()
  receivedDate: string;

  @ApiPropertyOptional({ example: 'RC-001', description: 'Reason code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  reasonCode?: string;

  @ApiPropertyOptional({ example: 'Promotional discount', description: 'Reason description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reasonDescription?: string;

  @ApiPropertyOptional({ enum: DeductionCategoryEnum, description: 'Deduction category' })
  @IsOptional()
  @IsEnum(DeductionCategoryEnum)
  category?: DeductionCategoryEnum;
}
