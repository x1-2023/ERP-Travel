import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ChequeStatusFilter {
  ISSUED = 'ISSUED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
  VOIDED = 'VOIDED',
  EXPIRED = 'EXPIRED',
}

export class ChequeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ChequeStatusFilter, description: 'Filter by cheque status' })
  @IsOptional()
  @IsEnum(ChequeStatusFilter)
  status?: ChequeStatusFilter;

  @ApiPropertyOptional({ example: 'cust_abc123', description: 'Filter by payee (Customer) ID' })
  @IsOptional()
  @IsString()
  payeeId?: string;

  @ApiPropertyOptional({ example: 'claim_xyz456', description: 'Filter by linked Claim ID' })
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiPropertyOptional({
    description: 'Filter cheques issued from this date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter cheques issued up to this date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
