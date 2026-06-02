import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TransactionTypeEnum {
  BUDGET_ALLOCATION = 'BUDGET_ALLOCATION',
  COMMITMENT = 'COMMITMENT',
  RELEASE = 'RELEASE',
  CLAIM_SETTLEMENT = 'CLAIM_SETTLEMENT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.COMMITMENT,
    description: 'Type of transaction (ledger entry)',
  })
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @ApiProperty({
    example: 25000,
    description:
      'Transaction amount. Can be positive or negative (e.g., RELEASE reverses a commitment).',
  })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    example: 'Q1 commitment for Walmart spring promo',
    maxLength: 500,
    description: 'Optional description for this transaction',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'clxyz1234567890',
    description: 'Fund ID this transaction is recorded against',
  })
  @IsString()
  fundId: string;

  @ApiPropertyOptional({
    example: 'clxyz0987654321',
    description: 'Promotion ID (if transaction is linked to a promotion)',
  })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({
    example: 'clxyz1111111111',
    description: 'Claim ID (if transaction is linked to a claim settlement)',
  })
  @IsOptional()
  @IsString()
  claimId?: string;
}
