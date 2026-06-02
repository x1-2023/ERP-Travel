import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWriteOffRuleDto } from './create-write-off-rule.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWriteOffRuleDto extends PartialType(
  OmitType(CreateWriteOffRuleDto, ['companyId'] as const),
) {
  @ApiPropertyOptional({ example: true, description: 'Whether the rule is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
