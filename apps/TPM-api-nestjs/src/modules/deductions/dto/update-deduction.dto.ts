import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDeductionDto } from './create-deduction.dto';

export class UpdateDeductionDto extends PartialType(
  OmitType(CreateDeductionDto, ['companyId', 'deductionNumber'] as const),
) {}
