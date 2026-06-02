import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MatchMethodEnum {
  AUTO_EXACT = 'AUTO_EXACT',
  AUTO_FUZZY = 'AUTO_FUZZY',
  AUTO_AI = 'AUTO_AI',
  MANUAL = 'MANUAL',
}

export class MatchDeductionDto {
  @ApiProperty({ example: 'promo_abc123', description: 'Promotion ID to match against' })
  @IsString()
  matchedPromotionId: string;

  @ApiPropertyOptional({ example: 'claim_abc123', description: 'Claim ID to match against' })
  @IsOptional()
  @IsString()
  matchedClaimId?: string;

  @ApiProperty({ enum: MatchMethodEnum, description: 'Method used for matching' })
  @IsEnum(MatchMethodEnum)
  matchMethod: MatchMethodEnum;

  @ApiPropertyOptional({ example: 95, description: 'Match confidence score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  matchScore?: number;
}
