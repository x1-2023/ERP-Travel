import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTargetDto } from './create-target.dto';

export class UpdateTargetDto extends PartialType(OmitType(CreateTargetDto, ['code'] as const)) {}
