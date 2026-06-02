import { IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTrackingDto {
  @ApiProperty({ example: 'cust_abc123', description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'prod_xyz456', description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: '2026-01', description: 'Period (e.g., "2026-01")' })
  @IsString()
  period: string;

  @ApiPropertyOptional({ example: 100, description: 'Sell-in quantity', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sellInQty?: number;

  @ApiPropertyOptional({ example: 5000.0, description: 'Sell-in value', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellInValue?: number;

  @ApiPropertyOptional({ example: 80, description: 'Sell-out quantity', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sellOutQty?: number;

  @ApiPropertyOptional({ example: 4000.0, description: 'Sell-out value', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellOutValue?: number;

  @ApiPropertyOptional({ example: 20, description: 'Stock quantity', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQty?: number;

  @ApiPropertyOptional({ example: 1000.0, description: 'Stock value', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockValue?: number;
}
