import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ResolveDisputeDto {
  @ApiProperty({ example: 'Agreed on partial credit', description: 'Resolution description' })
  @IsString()
  @MaxLength(2000)
  resolution: string;

  @ApiPropertyOptional({ example: 40000, description: 'Resolved amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  resolvedAmount?: number;
}
