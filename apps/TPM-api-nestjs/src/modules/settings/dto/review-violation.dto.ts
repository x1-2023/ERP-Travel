import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewViolationDto {
  @ApiPropertyOptional({ description: 'Review notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}
