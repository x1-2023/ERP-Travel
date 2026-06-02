import { IsString, IsOptional, IsDateString, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Trade Promotion 2024', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Promotional campaign for summer trade activities' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'cuid_customer_id', description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'cuid_fund_id', description: 'Fund ID' })
  @IsString()
  fundId: string;

  @ApiProperty({ example: '2024-06-01', description: 'ISO date string' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-08-31', description: 'ISO date string' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 500000000, description: 'Budget amount' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional({ example: 'DISPLAY' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'cuid_template_id', description: 'Template ID for cloning' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    example: 'cuid_promotion_id',
    description: 'ID of promotion this was cloned from',
  })
  @IsOptional()
  @IsString()
  clonedFromId?: string;
}
