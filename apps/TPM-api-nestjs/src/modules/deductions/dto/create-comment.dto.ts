import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Checked with finance team, amounts match',
    description: 'Comment content',
  })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this is an internal-only comment' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
