import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum POPStatusFilter {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class PopQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: POPStatusFilter, description: 'Filter by POP status' })
  @IsOptional()
  @IsEnum(POPStatusFilter)
  status?: POPStatusFilter;

  @ApiPropertyOptional({ example: 'claim_abc123', description: 'Filter by claim ID' })
  @IsOptional()
  @IsString()
  claimId?: string;
}
