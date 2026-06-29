import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15',
    description: 'Product name',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Kitchen Utensil',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
  })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;
}
