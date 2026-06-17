import { IsOptional, IsString } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  sort?: string;

  @IsOptional()
  stock?: string;
}
