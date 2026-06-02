import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DeductionResolutionEnum {
  FULL_MATCH = 'FULL_MATCH',
  PARTIAL_MATCH = 'PARTIAL_MATCH',
  OVERPAYMENT = 'OVERPAYMENT',
  UNDERPAYMENT = 'UNDERPAYMENT',
  INVALID = 'INVALID',
  WRITE_OFF = 'WRITE_OFF',
}

export class ResolveDeductionDto {
  @ApiProperty({ enum: DeductionResolutionEnum, description: 'Resolution type' })
  @IsEnum(DeductionResolutionEnum)
  resolutionType: DeductionResolutionEnum;

  @ApiProperty({ example: 50000, description: 'Resolved amount' })
  @Type(() => Number)
  @IsNumber()
  resolvedAmount: number;

  @ApiPropertyOptional({ example: 0, description: 'Variance amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  varianceAmount?: number;

  @ApiPropertyOptional({ example: 'Matched to Q2 promo deduction', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNotes?: string;
}
