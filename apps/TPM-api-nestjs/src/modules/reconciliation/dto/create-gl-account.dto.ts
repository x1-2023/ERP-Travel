import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GLAccountTypeEnum {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export class CreateGLAccountDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: '6100', description: 'Account code' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Trade Expense', description: 'Account name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: GLAccountTypeEnum })
  @IsEnum(GLAccountTypeEnum)
  type: GLAccountTypeEnum;

  @ApiPropertyOptional({ example: 'Operating Expenses' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultTradeExpense?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultAccruedLiability?: boolean;
}
