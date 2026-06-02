import { IsString, IsOptional, IsInt, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSellOutDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Unique transaction code' })
  @IsString()
  transactionCode: string;

  @ApiProperty({ description: 'Transaction date', example: '2026-01-15' })
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({ description: 'Promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'Channel ID' })
  @IsOptional()
  @IsString()
  channelId?: string;

  @ApiPropertyOptional({ description: 'Region ID' })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 80 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Quantity in cases', example: 8.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantityCase?: number;

  @ApiProperty({ description: 'Selling price per unit', example: 500.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ description: 'Total value', example: 40000.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalValue: number;

  @ApiPropertyOptional({ description: 'Source system name' })
  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @ApiPropertyOptional({ description: 'Source reference' })
  @IsOptional()
  @IsString()
  sourceReference?: string;

  @ApiProperty({ description: 'Period year', example: 2026 })
  @Type(() => Number)
  @IsInt()
  periodYear: number;

  @ApiProperty({ description: 'Period month', example: 1 })
  @Type(() => Number)
  @IsInt()
  periodMonth: number;

  @ApiProperty({ description: 'Period week', example: 3 })
  @Type(() => Number)
  @IsInt()
  periodWeek: number;
}
