import { IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormatEnum } from './create-report.dto';

export class ExecuteReportDto {
  @ApiPropertyOptional({
    enum: ReportFormatEnum,
    description: 'Override the default report format',
  })
  @IsOptional()
  @IsEnum(ReportFormatEnum)
  format?: ReportFormatEnum;

  @ApiPropertyOptional({
    example: { status: 'ACTIVE', startDate: { gte: '2024-01-01' } },
    description: 'Override filters for this execution',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    example: { dateRange: '2024-Q1' },
    description: 'Additional parameters for report generation',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
