import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ScenarioStatusFilter {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export class ScenarioQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ScenarioStatusFilter })
  @IsOptional()
  @IsEnum(ScenarioStatusFilter)
  status?: ScenarioStatusFilter;

  @ApiPropertyOptional({ description: 'Filter by creator user ID' })
  @IsOptional()
  @IsString()
  createdById?: string;
}
