import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WriteOffDeductionDto {
  @ApiProperty({
    example: 'Amount below threshold and aged over 90 days',
    description: 'Write-off reason',
  })
  @IsString()
  @MaxLength(2000)
  writeOffReason: string;
}
