import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGeographicUnitDto } from './create-geographic-unit.dto';

export class UpdateGeographicUnitDto extends PartialType(
  OmitType(CreateGeographicUnitDto, ['code'] as const),
) {}
