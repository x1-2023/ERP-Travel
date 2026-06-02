import { IsString, IsOptional, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateClaimDto {
  @ApiProperty({ example: 'cust_abc123', description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ example: 'promo_xyz456', description: 'Promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiProperty({ example: 50000, description: 'Claim amount', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ example: '2024-06-15', description: 'Claim date (ISO date string)' })
  @IsDateString()
  claimDate: string;

  @ApiPropertyOptional({ example: 'Claim for Q2 promotion discount', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Supporting documents (JSON)', type: 'object' })
  @IsOptional()
  documents?: any;
}
