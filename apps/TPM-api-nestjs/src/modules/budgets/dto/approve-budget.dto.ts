import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveBudgetDto {
  @ApiPropertyOptional({ example: 'Approved for Q1 execution' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}

export class RejectBudgetDto {
  @ApiPropertyOptional({ example: 'Budget exceeds department limit' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
