import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum SOXControlTypeFilter {
  SEGREGATION_OF_DUTIES = 'SEGREGATION_OF_DUTIES',
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  DUAL_CONTROL = 'DUAL_CONTROL',
  TIME_RESTRICTION = 'TIME_RESTRICTION',
  DATA_ACCESS = 'DATA_ACCESS',
}

export enum SOXControlStatusFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
}

export class SOXControlQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: SOXControlTypeFilter })
  @IsOptional()
  @IsEnum(SOXControlTypeFilter)
  type?: SOXControlTypeFilter;

  @ApiPropertyOptional({ enum: SOXControlStatusFilter })
  @IsOptional()
  @IsEnum(SOXControlStatusFilter)
  status?: SOXControlStatusFilter;
}
