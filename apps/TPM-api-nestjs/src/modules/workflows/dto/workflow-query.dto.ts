import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApprovalRuleTypeEnum, ChannelEnum } from './create-approval-rule.dto';

export class WorkflowQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ApprovalRuleTypeEnum })
  @IsOptional()
  @IsEnum(ApprovalRuleTypeEnum)
  type?: ApprovalRuleTypeEnum;

  @ApiPropertyOptional({ enum: ChannelEnum })
  @IsOptional()
  @IsEnum(ChannelEnum)
  channel?: ChannelEnum;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;
}
