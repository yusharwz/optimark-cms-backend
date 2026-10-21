import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ArticleCreateInput) {
    return this.prisma.article.create({
      data,
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });
  }

  async findAll(params: {
    where?: Prisma.ArticleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ArticleOrderByWithRelationInput;
  }) {
    const { where, skip, take, orderBy } = params;
    return this.prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        slugId: true,
        slugEn: true,
        excerpt: true,
        metaTitle: true,
        metaDescription: true,
        canonicalUrl: true,
        coverImageUrl: true,
        coverImageAlt: true,
        tags: true,
        readMinutes: true,
        status: true,
        featured: true,
        previewToken: true,
        publishedAt: true,
        scheduledAt: true,
        contentUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        authorId: true,
        reviewerId: true,
        category: true,
        author: true,
        reviewer: true,
        translations: {
          select: {
            id: true,
            articleId: true,
            locale: true,
            title: true,
            slug: true,
            excerpt: true,
            metaTitle: true,
            metaDescription: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.ArticleWhereInput) {
    return this.prisma.article.count({ where });
  }

  async findById(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });
  }

  async findByPreviewToken(previewToken: string) {
    return this.prisma.article.findUnique({
      where: { previewToken },
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });
  }

  async update(id: string, data: Prisma.ArticleUpdateInput) {
    return this.prisma.article.update({
      where: { id },
      data,
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.article.delete({
      where: { id },
    });
  }

  async findDueScheduled(now: Date) {
    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.SCHEDULED,
        scheduledAt: {
          lte: now,
        },
      },
    });
  }
}
