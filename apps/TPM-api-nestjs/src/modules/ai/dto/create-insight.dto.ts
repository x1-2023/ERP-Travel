import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const INSIGHT_TYPES = [
  'TREND',
  'ANOMALY',
  'RECOMMENDATION',
  'FORECAST',
  'ALERT',
  'OPPORTUNITY',
] as const;

export type InsightType = (typeof INSIGHT_TYPES)[number];

export class CreateInsightDto {
  @ApiProperty({
    example: 'RECOMMENDATION',
    enum: INSIGHT_TYPES,
    description: 'Insight type',
  })
  @IsString()
  @IsIn(INSIGHT_TYPES)
  type: string;

  @ApiProperty({
    example: 'Increase discount for Q2 beverage promotions',
    maxLength: 200,
    description: 'Insight title',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example:
      'Analysis shows that increasing the discount by 5% on beverage promotions during Q2 could improve ROI by 18%.',
    description: 'Detailed description of the insight',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: { currentROI: 2.3, projectedROI: 2.7, category: 'Beverages' },
    description: 'Supporting data for the insight',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    example: 0.87,
    minimum: 0,
    maximum: 1,
    description: 'Confidence score (0-1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this insight has a recommended action',
  })
  @IsOptional()
  @IsBoolean()
  actionable?: boolean;

  @ApiPropertyOptional({
    example: 'Adjust discount to 20% for upcoming Q2 promotions',
    description: 'Recommended action to take',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    example: 'Promotion',
    description: 'Related entity type (e.g., Promotion, Customer, Claim)',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    example: 'promo_abc123',
    description: 'Related entity ID',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 5,
    description: 'Priority level (1-5, where 5 is highest)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @ApiPropertyOptional({
    example: '2026-03-31T23:59:59Z',
    description: 'When the insight expires (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
