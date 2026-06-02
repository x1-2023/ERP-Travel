import { IsString, IsOptional, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Q1', description: 'Milestone name (e.g. Q1, H1, 9M, FY)' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 25000, description: 'Target volume for this milestone', minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  targetVolume: number;

  @ApiProperty({ example: '2024-03-31', description: 'Milestone deadline (ISO date string)' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ example: 5000, description: 'Bonus amount for achieving this milestone' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusAmount?: number;
}
