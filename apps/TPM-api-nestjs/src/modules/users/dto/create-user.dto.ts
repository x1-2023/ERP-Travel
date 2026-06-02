import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  KAM = 'KAM',
  FINANCE = 'FINANCE',
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@company.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', maxLength: 100, description: 'Full name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'SecureP@ss1', minLength: 8, description: 'Password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ enum: RoleEnum, default: RoleEnum.KAM, description: 'User role' })
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'cuid_company_id', description: 'Company ID' })
  @IsString()
  companyId: string;
}
