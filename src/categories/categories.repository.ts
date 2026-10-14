import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto & { slug: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        nameId: data.nameId || data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        descriptionId: data.descriptionId || data.description,
        descriptionEn: data.descriptionEn,
        metaTitleId: data.metaTitleId,
        metaTitleEn: data.metaTitleEn,
        metaDescriptionId: data.metaDescriptionId,
        metaDescriptionEn: data.metaDescriptionEn,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
