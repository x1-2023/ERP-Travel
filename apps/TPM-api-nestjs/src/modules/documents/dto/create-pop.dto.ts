import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePopDto {
  @ApiProperty({ example: 'file_abc123', description: 'File ID to link as POP' })
  @IsString()
  fileId: string;

  @ApiProperty({ example: 'claim_abc123', description: 'Claim ID for this POP' })
  @IsString()
  claimId: string;
}
