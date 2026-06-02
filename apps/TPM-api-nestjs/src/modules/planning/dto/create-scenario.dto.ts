import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScenarioDto {
  @ApiProperty({ example: 'Q1 Promo Impact Analysis', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Analyzing impact of Q1 promotional campaigns' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Baseline ID to compare against' })
  @IsOptional()
  @IsString()
  baselineId?: string;

  @ApiProperty({
    description: 'Scenario input parameters',
    example: { discount: 15, duration: 30 },
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiPropertyOptional({ description: 'Business assumptions', example: { growthRate: 5 } })
  @IsOptional()
  @IsObject()
  assumptions?: Record<string, any>;
}
