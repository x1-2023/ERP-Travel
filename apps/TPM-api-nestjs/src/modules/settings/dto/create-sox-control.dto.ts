import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SOXControlTypeEnum {
  SEGREGATION_OF_DUTIES = 'SEGREGATION_OF_DUTIES',
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  DUAL_CONTROL = 'DUAL_CONTROL',
  TIME_RESTRICTION = 'TIME_RESTRICTION',
  DATA_ACCESS = 'DATA_ACCESS',
}

export enum SOXControlStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
}

export class CreateSOXControlDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'SOD-001', description: 'Control code' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Segregation of Duties - Approval', description: 'Control name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Control description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: SOXControlTypeEnum })
  @IsEnum(SOXControlTypeEnum)
  type: SOXControlTypeEnum;

  @ApiPropertyOptional({ enum: SOXControlStatusEnum, default: SOXControlStatusEnum.ACTIVE })
  @IsOptional()
  @IsEnum(SOXControlStatusEnum)
  status?: SOXControlStatusEnum;

  @ApiProperty({ description: 'Control configuration', example: { maxAmount: 100000 } })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBlocking?: boolean;

  @ApiPropertyOptional({ default: 'HIGH' })
  @IsOptional()
  @IsString()
  severity?: string;
}
