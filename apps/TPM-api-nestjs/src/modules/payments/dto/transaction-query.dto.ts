import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TransactionTypeEnum } from './create-transaction.dto';

export class TransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: TransactionTypeEnum,
    description: 'Filter by transaction type',
  })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @ApiPropertyOptional({ description: 'Filter by fund ID' })
  @IsOptional()
  @IsString()
  fundId?: string;

  @ApiPropertyOptional({ description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({ description: 'Filter by claim ID' })
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Filter transactions created on or after this date',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Filter transactions created on or before this date',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
