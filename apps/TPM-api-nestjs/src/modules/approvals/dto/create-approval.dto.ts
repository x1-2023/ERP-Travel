import { IsString, IsInt, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateApprovalDto {
  @ApiProperty({ example: 'clxyz123abc', description: 'Budget ID to approve' })
  @IsString()
  budgetId: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 5, description: 'Approval level (1, 2, 3)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  level: number;

  @ApiProperty({ example: 'KAM Manager', description: 'Role required for this approval level' })
  @IsString()
  @MaxLength(100)
  role: string;

  @ApiPropertyOptional({ example: 'user123', description: 'Assigned reviewer ID' })
  @IsOptional()
  @IsString()
  reviewerId?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Assigned reviewer name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reviewerName?: string;

  @ApiPropertyOptional({
    example: 'Please review Q1 budget allocation',
    description: 'Submission comments',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
