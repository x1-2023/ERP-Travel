import { IsString, IsOptional, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ChannelEnum {
  MT = 'MT',
  GT = 'GT',
  ECOMMERCE = 'ECOMMERCE',
  HORECA = 'HORECA',
  OTHER = 'OTHER',
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'CUST-001', description: 'Unique customer code within the company' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Big C Supercenter', description: 'Customer name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ enum: ChannelEnum, default: ChannelEnum.MT, description: 'Sales channel' })
  @IsOptional()
  @IsEnum(ChannelEnum)
  channel?: ChannelEnum;

  @ApiPropertyOptional({ example: 'Hypermarket', description: 'Sub-channel classification' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subChannel?: string;

  @ApiPropertyOptional({
    example: '123 Nguyen Hue, District 1, HCMC',
    description: 'Customer address',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '0300000000', description: 'Tax identification code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string;

  @ApiProperty({ example: 'cuid_company_id', description: 'Company ID for multi-tenant isolation' })
  @IsString()
  companyId: string;
}
