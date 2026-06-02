import { IsString, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDeductionDocumentDto {
  @ApiProperty({ example: 'invoice-2024-001.pdf', description: 'File name' })
  @IsString()
  @MaxLength(500)
  fileName: string;

  @ApiProperty({ example: 'application/pdf', description: 'File MIME type' })
  @IsString()
  @MaxLength(100)
  fileType: string;

  @ApiProperty({ example: 102400, description: 'File size in bytes' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fileSize: number;

  @ApiProperty({
    example: '/uploads/deductions/invoice-2024-001.pdf',
    description: 'File path or URL',
  })
  @IsString()
  @MaxLength(1000)
  filePath: string;

  @ApiProperty({
    example: 'INVOICE',
    description: 'Document type (e.g., INVOICE, CREDIT_NOTE, PROOF)',
  })
  @IsString()
  @MaxLength(100)
  documentType: string;
}
