import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecordSpendingDto {
  @ApiProperty({ example: 1500.5, description: 'Spending amount', minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    example: 'Display materials purchased',
    description: 'Description of spending',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
