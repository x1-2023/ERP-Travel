import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @ApiProperty({ example: 'clxyz1234567890', description: 'Budget ID' })
  @IsString()
  budgetId: string;

  @ApiPropertyOptional({ example: 'clxyz0987654321', description: 'Budget Allocation ID' })
  @IsOptional()
  @IsString()
  budgetAllocationId?: string;

  @ApiPropertyOptional({ example: 'clxyz1111111111', description: 'Promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiProperty({
    example: 'promotion',
    description: 'Activity type',
    enum: ['promotion', 'display', 'sampling', 'event', 'listing_fee'],
  })
  @IsString()
  @IsIn(['promotion', 'display', 'sampling', 'event', 'listing_fee'])
  activityType: string;

  @ApiProperty({ example: 'Q1 Display Campaign', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  activityName: string;

  @ApiPropertyOptional({ example: 'ACT-001', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  activityCode?: string;

  @ApiProperty({ example: 50000, description: 'Allocated amount', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31T23:59:59.000Z', description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Notes about this activity', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
