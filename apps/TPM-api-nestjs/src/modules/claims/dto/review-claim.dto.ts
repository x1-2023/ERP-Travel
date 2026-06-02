import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewClaimStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewClaimDto {
  @ApiProperty({ enum: ReviewClaimStatus, description: 'Review decision' })
  @IsEnum(ReviewClaimStatus)
  status: ReviewClaimStatus;

  @ApiPropertyOptional({ example: 'Claim verified against promotion terms', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}
