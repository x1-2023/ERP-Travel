import { IsString, IsOptional, IsNumber, IsEnum, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum FundTypeEnum {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export class CreateFundDto {
  @ApiProperty({ example: 'FUND-2026-001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Q1 Trade Marketing Fund', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    enum: FundTypeEnum,
    default: FundTypeEnum.FIXED,
    description: 'FIXED = On-Invoice, VARIABLE = Off-Invoice (performance-based)',
  })
  @IsOptional()
  @IsEnum(FundTypeEnum)
  type?: FundTypeEnum = FundTypeEnum.FIXED;

  @ApiProperty({ example: 2026, description: 'Fiscal year' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ example: 500000, description: 'Total budget amount', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalBudget: number;

  @ApiProperty({ example: 'clxyz1234567890', description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiPropertyOptional({
    example: 'clxyz0987654321',
    description: 'Customer ID (for customer-specific funds)',
  })
  @IsOptional()
  @IsString()
  customerId?: string;
}
