import { IsString, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSuggestionDto {
  @ApiProperty({ example: 'PROMO_OPTIMIZATION', description: 'Type of AI suggestion' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: { promotionId: 'promo_abc', currentDiscount: 15 },
    description: 'Input data for the suggestion',
  })
  @IsObject()
  input: Record<string, any>;

  @ApiProperty({
    example: { recommendedDiscount: 20, expectedLift: 12.5 },
    description: 'Output/result data from the suggestion',
  })
  @IsObject()
  output: Record<string, any>;
}
