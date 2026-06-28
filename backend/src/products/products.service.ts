import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
) {}

  async create(
    dto: CreateProductDto,
    file: Express.Multer.File,
    ) {
    // Upload image

    const imageUrl = await this.cloudinaryService.upload(file);

    // Save product

    return this.prisma.product.create({
      data: {
        ...dto,
        imageUrl,
      },
    });
}

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: {
        id,
      },
    });
}

  async findAll(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const skip = (page - 1) * limit;

    let where = {};

    // stock=gt:0
    if (query.stock) {
      const [operator, value] = query.stock.split(':');

      if (operator === 'gt') {
        where = {
          stock: {
            gt: Number(value),
          },
        };
      }
    }
    let orderBy = {
      createdAt: 'desc' as const,
    };

    if (query.sort) {
      orderBy = {
        createdAt: 'desc' as const,
        [query.sort]: 'asc',
    };
}

    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
});

    const total = await this.prisma.product.count({
      where,
    });

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
