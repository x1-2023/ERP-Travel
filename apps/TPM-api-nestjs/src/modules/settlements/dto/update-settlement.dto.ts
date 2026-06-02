import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSettlementDto } from './create-settlement.dto';

export class UpdateSettlementDto extends PartialType(
  OmitType(CreateSettlementDto, ['claimId'] as const),
) {}
