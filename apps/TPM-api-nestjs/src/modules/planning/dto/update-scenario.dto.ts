import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScenarioDto {
  @ApiPropertyOptional({ example: 'Updated Scenario Name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Baseline ID to compare against' })
  @IsOptional()
  @IsString()
  baselineId?: string;

  @ApiPropertyOptional({ description: 'Scenario input parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Business assumptions' })
  @IsOptional()
  @IsObject()
  assumptions?: Record<string, any>;
}
