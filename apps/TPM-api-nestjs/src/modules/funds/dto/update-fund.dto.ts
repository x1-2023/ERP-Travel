import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFundDto } from './create-fund.dto';

export class UpdateFundDto extends PartialType(
  OmitType(CreateFundDto, ['companyId', 'code', 'year'] as const),
) {}
