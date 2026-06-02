import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ActivityQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by budget ID' })
  @IsOptional()
  @IsString()
  budgetId?: string;

  @ApiPropertyOptional({
    description: 'Filter by activity type',
    enum: ['promotion', 'display', 'sampling', 'event', 'listing_fee'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['promotion', 'display', 'sampling', 'event', 'listing_fee'])
  activityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;
}
