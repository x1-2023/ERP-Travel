import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WriteOffCategoryEnum {
  TRADE_PROMOTION = 'TRADE_PROMOTION',
  PRICING = 'PRICING',
  LOGISTICS = 'LOGISTICS',
  QUALITY = 'QUALITY',
  ADVERTISING = 'ADVERTISING',
  OTHER = 'OTHER',
}

export class CreateWriteOffRuleDto {
  @ApiProperty({ example: 'Small Amount Auto Write-Off', description: 'Rule name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Auto write-off for deductions under $100 aged 90+ days' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'comp_abc123', description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 100, description: 'Maximum amount eligible for write-off' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount: number;

  @ApiPropertyOptional({ example: 90, description: 'Minimum aging days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAgeDays?: number;

  @ApiPropertyOptional({
    enum: WriteOffCategoryEnum,
    isArray: true,
    description: 'Applicable deduction categories',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WriteOffCategoryEnum, { each: true })
  categories?: WriteOffCategoryEnum[];

  @ApiPropertyOptional({ example: true, description: 'Whether approval is required' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ example: 'role_abc123', description: 'Approver role ID' })
  @IsOptional()
  @IsString()
  approverRoleId?: string;
}
