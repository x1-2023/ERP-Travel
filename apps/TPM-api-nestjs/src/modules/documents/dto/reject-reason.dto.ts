import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectReasonDto {
  @ApiProperty({
    example: 'Document does not match the promotion requirements',
    description: 'Rejection reason',
  })
  @IsString()
  @MaxLength(2000)
  rejectReason: string;
}
