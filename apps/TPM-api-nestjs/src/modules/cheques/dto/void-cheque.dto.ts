import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoidChequeDto {
  @ApiProperty({
    example: 'Duplicate payment detected',
    description: 'Reason for voiding the cheque (required)',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @MinLength(3, { message: 'Void reason must be at least 3 characters' })
  @MaxLength(500)
  voidReason: string;
}
