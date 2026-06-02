import { IsString, IsOptional, IsInt, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSellInDto {
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

  @ApiProperty({ description: 'Quantity', example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Quantity in cases', example: 10.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantityCase?: number;

  @ApiProperty({ description: 'Gross value', example: 50000.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  grossValue: number;

  @ApiPropertyOptional({ description: 'Discount value', example: 5000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValue?: number;

  @ApiProperty({ description: 'Net value', example: 45000.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  netValue: number;

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
