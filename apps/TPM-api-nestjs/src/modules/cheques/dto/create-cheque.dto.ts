import { IsString, IsOptional, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateChequeDto {
  @ApiProperty({ example: 'CHQ-000001', description: 'Unique cheque number' })
  @IsString()
  @MaxLength(50)
  chequeNumber: string;

  @ApiProperty({ example: 'cust_abc123', description: 'Payee (Customer) ID' })
  @IsString()
  payeeId: string;

  @ApiProperty({ example: 50000, description: 'Cheque amount', minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ example: '2024-06-15', description: 'Issue date (ISO date string)' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2024-09-15', description: 'Due date (ISO date string)' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'claim_xyz456', description: 'Linked Claim ID' })
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiPropertyOptional({ example: 'ACCT-001', description: 'Bank account reference' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccount?: string;

  @ApiPropertyOptional({
    example: 'Payment for Q2 promotion',
    description: 'Memo note',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  memo?: string;
}
