import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DisputeStatusEnum {
  OPEN = 'OPEN',
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  PENDING_INTERNAL = 'PENDING_INTERNAL',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class UpdateDisputeDto {
  @ApiPropertyOptional({ enum: DisputeStatusEnum, description: 'Dispute status' })
  @IsOptional()
  @IsEnum(DisputeStatusEnum)
  status?: DisputeStatusEnum;

  @ApiPropertyOptional({
    example: 'Customer agrees to partial resolution',
    description: 'Customer response',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customerResponse?: string;

  @ApiPropertyOptional({ description: 'Date of customer response' })
  @IsOptional()
  @IsDateString()
  customerResponseDate?: string;

  @ApiPropertyOptional({ example: 'Jane Smith', description: 'Customer contact name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerContactName?: string;

  @ApiPropertyOptional({ example: 'jane@customer.com', description: 'Customer contact email' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerContactEmail?: string;
}
