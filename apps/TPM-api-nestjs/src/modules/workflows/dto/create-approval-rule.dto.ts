import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ApprovalRuleTypeEnum {
  SINGLE_APPROVAL = 'SINGLE_APPROVAL',
  MULTI_LEVEL = 'MULTI_LEVEL',
  COMMITTEE = 'COMMITTEE',
  AUTO_APPROVE = 'AUTO_APPROVE',
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  KAM = 'KAM',
  FINANCE = 'FINANCE',
}

export enum ChannelEnum {
  MT = 'MT',
  GT = 'GT',
  ECOMMERCE = 'ECOMMERCE',
  HORECA = 'HORECA',
  OTHER = 'OTHER',
}

export class CreateApprovalRuleDto {
  @ApiProperty({ example: 'High-Value Approval', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Approval rule for high-value promotions' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    enum: ApprovalRuleTypeEnum,
    default: ApprovalRuleTypeEnum.SINGLE_APPROVAL,
  })
  @IsOptional()
  @IsEnum(ApprovalRuleTypeEnum)
  type?: ApprovalRuleTypeEnum;

  @ApiProperty({ example: 0, minimum: 0, description: 'Minimum amount threshold' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount: number;

  @ApiPropertyOptional({ example: 1000000, description: 'Maximum amount threshold' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ enum: ChannelEnum })
  @IsOptional()
  @IsEnum(ChannelEnum)
  channel?: ChannelEnum;

  @ApiProperty({
    enum: RoleEnum,
    isArray: true,
    example: [RoleEnum.ADMIN, RoleEnum.MANAGER],
    description: 'Roles that can approve',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleEnum, { each: true })
  approverRoles: RoleEnum[];

  @ApiPropertyOptional({
    example: 0,
    default: 0,
    description: 'Rule priority (higher = more priority)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'clxyz123', description: 'Company ID' })
  @IsString()
  companyId: string;
}
