import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateApprovalRuleDto } from './create-approval-rule.dto';

export class UpdateApprovalRuleDto extends PartialType(
  OmitType(CreateApprovalRuleDto, ['companyId'] as const),
) {}
