import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDisputeDto {
  @ApiProperty({ example: 'Incorrect deduction amount', description: 'Dispute reason' })
  @IsString()
  @MaxLength(2000)
  disputeReason: string;

  @ApiProperty({ example: 50000, description: 'Disputed amount' })
  @Type(() => Number)
  @IsNumber()
  disputeAmount: number;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Customer contact name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerContactName?: string;

  @ApiPropertyOptional({ example: 'john@customer.com', description: 'Customer contact email' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerContactEmail?: string;
}
