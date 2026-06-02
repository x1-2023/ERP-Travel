import { IsString, IsInt, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFiscalPeriodDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Fiscal year', example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ description: 'Fiscal month (1-12)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Fiscal quarter (1-4)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter: number;

  @ApiProperty({ description: 'Period name', example: 'January 2026' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Period start date', example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Period end date', example: '2026-01-31' })
  @IsDateString()
  endDate: string;
}
