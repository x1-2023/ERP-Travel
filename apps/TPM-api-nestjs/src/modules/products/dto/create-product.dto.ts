import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  sku: string;

  @ApiProperty({ example: 'Pepsi Cola 330ml', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Beverages' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'Pepsi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: 15000, description: 'Cost of goods sold' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cogs?: number;

  @ApiPropertyOptional({ example: 25000, description: 'Retail price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'EA', default: 'EA', description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string = 'EA';

  @ApiProperty({ example: 'clxyz1234567890', description: 'Company ID' })
  @IsString()
  companyId: string;
}
