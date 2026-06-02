import { IsString, IsOptional, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSettlementDto {
  @ApiProperty({ example: 'clm_abc123', description: 'Claim ID to settle' })
  @IsString()
  claimId: string;

  @ApiProperty({
    example: 48000,
    description: 'Settled amount',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Settled amount must be >= 0' })
  settledAmount: number;

  @ApiPropertyOptional({
    example: -2000,
    description: 'Variance between settled amount and claim amount (auto-calculated if omitted)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  variance?: number;

  @ApiPropertyOptional({
    example: 'Settlement after negotiation with customer',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    example: '2024-06-20T00:00:00.000Z',
    description: 'Settlement date (defaults to now)',
  })
  @IsOptional()
  @IsDateString()
  settledAt?: string;
}
