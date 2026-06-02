import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @ApiProperty({ example: 'company_abc123', description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'VC-2024-001', description: 'Unique contract code' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Annual Volume Agreement - Carrefour', description: 'Contract name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'cust_abc123', description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: '2024-01-01', description: 'Contract start date (ISO date string)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Contract end date (ISO date string)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 100000, description: 'Target volume', minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  targetVolume: number;

  @ApiPropertyOptional({
    example: 'PERCENTAGE',
    enum: ['FIXED', 'PERCENTAGE', 'TIERED'],
    description: 'Bonus type',
  })
  @IsOptional()
  @IsEnum({ FIXED: 'FIXED', PERCENTAGE: 'PERCENTAGE', TIERED: 'TIERED' })
  bonusType?: string;

  @ApiProperty({ example: 5.0, description: 'Bonus value (percentage or fixed amount)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusValue: number;

  @ApiPropertyOptional({ description: 'Bonus condition (JSON)', type: 'object' })
  @IsOptional()
  bonusCondition?: any;

  @ApiPropertyOptional({ example: 'MODERN_TRADE', description: 'Pepsi channel' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ example: 'CENTRAL', description: 'Pepsi region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    example: ['CARBONATED', 'JUICE'],
    description: 'Pepsi categories',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: 'Volume agreement notes',
    description: 'Additional notes',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
