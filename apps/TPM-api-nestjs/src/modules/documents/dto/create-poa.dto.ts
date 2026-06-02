import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePoaDto {
  @ApiProperty({ example: 'file_abc123', description: 'File ID to link as POA' })
  @IsString()
  fileId: string;

  @ApiProperty({ example: 'promo_abc123', description: 'Promotion ID for this POA' })
  @IsString()
  promotionId: string;
}
