import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum GLJournalSourceEnum {
  ACCRUAL = 'ACCRUAL',
  SETTLEMENT = 'SETTLEMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL',
  IMPORT = 'IMPORT',
}

export class CreateJournalLineDto {
  @ApiProperty({ example: 1, description: 'Line number' })
  @Type(() => Number)
  @IsInt()
  lineNumber: number;

  @ApiProperty({ example: '6100', description: 'GL account code' })
  @IsString()
  accountCode: string;

  @ApiProperty({ example: 'Trade Expense', description: 'GL account name' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: 50000, description: 'Debit amount' })
  @Type(() => Number)
  @IsNumber()
  debitAmount: number;

  @ApiProperty({ example: 0, description: 'Credit amount' })
  @Type(() => Number)
  @IsNumber()
  creditAmount: number;

  @ApiPropertyOptional({ description: 'Cost center' })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiPropertyOptional({ description: 'Profit center' })
  @IsOptional()
  @IsString()
  profitCenter?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Brand code' })
  @IsOptional()
  @IsString()
  brandCode?: string;

  @ApiPropertyOptional({ description: 'Channel code' })
  @IsOptional()
  @IsString()
  channelCode?: string;

  @ApiPropertyOptional({ description: 'Line description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'JE-2024-001', description: 'Journal number' })
  @IsString()
  @MaxLength(50)
  journalNumber: string;

  @ApiProperty({ description: 'Journal date', example: '2024-01-31' })
  @IsDateString()
  journalDate: string;

  @ApiProperty({ description: 'Fiscal Period ID' })
  @IsString()
  fiscalPeriodId: string;

  @ApiProperty({ description: 'Journal description' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ enum: GLJournalSourceEnum })
  @IsEnum(GLJournalSourceEnum)
  source: GLJournalSourceEnum;

  @ApiPropertyOptional({ description: 'Source reference' })
  @IsOptional()
  @IsString()
  sourceRef?: string;

  @ApiProperty({ example: 50000, description: 'Total debit' })
  @Type(() => Number)
  @IsNumber()
  totalDebit: number;

  @ApiProperty({ example: 50000, description: 'Total credit' })
  @Type(() => Number)
  @IsNumber()
  totalCredit: number;

  @ApiProperty({ type: [CreateJournalLineDto], description: 'Journal lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalLineDto)
  lines: CreateJournalLineDto[];
}
