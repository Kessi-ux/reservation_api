import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15',
    description: 'Product name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;
}
