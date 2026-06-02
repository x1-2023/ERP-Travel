import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAllocationDto {
  @ApiProperty({ example: 'geo-unit-123', description: 'Geographic unit ID for this allocation' })
  @IsString()
  geographicUnitId: string;

  @ApiProperty({ example: 500000000, description: 'Allocated amount in VND' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @ApiPropertyOptional({
    example: 'alloc-parent-123',
    description: 'Parent allocation ID for hierarchy',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 'Marketing allocation for HCM region' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
