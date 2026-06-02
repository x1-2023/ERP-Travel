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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateContractDto {
  @ApiPropertyOptional({
    example: 'Annual Volume Agreement - Carrefour',
    description: 'Contract name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'cust_abc123', description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Contract start date (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Contract end date (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 100000, description: 'Target volume', minimum: 0.01 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  targetVolume?: number;

  @ApiPropertyOptional({
    example: 'PERCENTAGE',
    enum: ['FIXED', 'PERCENTAGE', 'TIERED'],
    description: 'Bonus type',
  })
  @IsOptional()
  @IsEnum({ FIXED: 'FIXED', PERCENTAGE: 'PERCENTAGE', TIERED: 'TIERED' })
  bonusType?: string;

  @ApiPropertyOptional({ example: 5.0, description: 'Bonus value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusValue?: number;

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
    example: 'Updated notes',
    description: 'Additional notes',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
