import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(
  OmitType(CreateReportDto, ['companyId'] as const),
) {}
