import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRejectDto {
  @ApiPropertyOptional({
    example: 'Approved - budget looks good for Q1',
    description: 'Comments for the approval or rejection',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
