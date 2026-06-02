import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TargetMetricEnum } from './create-target.dto';

export class CreateTargetAllocationDto {
  @ApiProperty({ example: 'geo-unit-123', description: 'Geographic unit ID for this allocation' })
  @IsString()
  geographicUnitId: string;

  @ApiProperty({ example: 10000, minimum: 0, description: 'Target value for this allocation' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetValue: number;

  @ApiPropertyOptional({ enum: TargetMetricEnum, description: 'Metric for this allocation' })
  @IsOptional()
  @IsEnum(TargetMetricEnum)
  metric?: TargetMetricEnum;

  @ApiPropertyOptional({
    example: 'alloc-parent-123',
    description: 'Parent allocation ID for hierarchy',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 'Target allocation for HCM region' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
