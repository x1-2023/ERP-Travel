import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { EntitySyncTypeEnum } from './create-sync-config.dto';

export class SyncConfigQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by connection ID' })
  @IsOptional()
  @IsString()
  connectionId?: string;

  @ApiPropertyOptional({ enum: EntitySyncTypeEnum, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(EntitySyncTypeEnum)
  entityType?: EntitySyncTypeEnum;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
