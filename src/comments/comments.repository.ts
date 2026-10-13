import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommentStatus, Prisma } from '@prisma/client';
import { QueryCommentDto } from './dto/query-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedBySlug(slug: string) {
    return this.prisma.comment.findMany({
      where: {
        slug,
        status: CommentStatus.APPROVED,
        parentId: null, // Root comments
      },
      include: {
        replies: {
          where: { status: CommentStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(query: QueryCommentDto) {
    const { status, slug, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (slug) {
      where.slug = slug;
    }

    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorEmail: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
          parent: {
            select: { id: true, authorName: true, content: true },
          },
          replies: {
            select: { id: true, authorName: true, status: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        article: true,
        replies: true,
      },
    });
  }

  async create(data: Prisma.CommentUncheckedCreateInput) {
    return this.prisma.comment.create({
      data,
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: CommentStatus) {
    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, pending, approved, spam, rejected] = await Promise.all([
      this.prisma.comment.count(),
      this.prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      this.prisma.comment.count({ where: { status: CommentStatus.APPROVED } }),
      this.prisma.comment.count({ where: { status: CommentStatus.SPAM } }),
      this.prisma.comment.count({ where: { status: CommentStatus.REJECTED } }),
    ]);

    return {
      total,
      pending,
      approved,
      spam,
      rejected,
    };
  }
}
