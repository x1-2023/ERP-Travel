import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum BudgetFundType {
  PROMOTIONAL = 'PROMOTIONAL',
  TACTICAL = 'TACTICAL',
  FIXED_INVESTMENT = 'FIXED_INVESTMENT',
  TRADE_SPEND = 'TRADE_SPEND',
  LISTING_FEE = 'LISTING_FEE',
  DISPLAY = 'DISPLAY',
}

export class CreateBudgetDto {
  @ApiProperty({ example: 'Q1 2024 Marketing Budget', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Budget for Q1 marketing campaigns' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 2024, minimum: 2020, maximum: 2030 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiProperty({ example: 1000000000, description: 'Total amount in VND' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-03-31', description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'MARKETING' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: BudgetFundType, default: BudgetFundType.PROMOTIONAL })
  @IsOptional()
  @IsEnum(BudgetFundType)
  fundType?: BudgetFundType;
}
