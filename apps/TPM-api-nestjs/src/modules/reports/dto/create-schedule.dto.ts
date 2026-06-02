import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormatEnum, ReportFrequencyEnum } from './create-report.dto';

export class CreateScheduleDto {
  @ApiProperty({ enum: ReportFrequencyEnum, example: 'WEEKLY' })
  @IsEnum(ReportFrequencyEnum)
  frequency: ReportFrequencyEnum;

  @ApiPropertyOptional({
    example: '0 8 * * 1',
    description: 'Cron expression for custom schedules',
  })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ enum: ReportFormatEnum, default: 'EXCEL' })
  @IsOptional()
  @IsEnum(ReportFormatEnum)
  format?: ReportFormatEnum;

  @ApiPropertyOptional({
    example: ['user1@company.com', 'user2@company.com'],
    description: 'Email recipients for scheduled report delivery',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({
    example: { status: 'ACTIVE' },
    description: 'Override filters for scheduled execution',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ default: true, description: 'Whether this schedule is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
