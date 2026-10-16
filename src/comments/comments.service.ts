import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { CommentStatus } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getApprovedCommentsBySlug(slug: string) {
    return this.commentsRepo.findApprovedBySlug(slug);
  }

  async submitComment(dto: CreateCommentDto) {
    // Check if article exists to link articleId
    const article = await this.prisma.article.findFirst({
      where: {
        OR: [
          { slug: dto.slug },
          { slugId: dto.slug },
          { slugEn: dto.slug },
          { translations: { some: { slug: dto.slug } } },
        ],
      },
      select: { id: true, slug: true },
    });

    return this.commentsRepo.create({
      slug: article?.slug || dto.slug,
      authorName: dto.authorName.trim(),
      authorEmail: dto.authorEmail.trim().toLowerCase(),
      authorWebsite: dto.authorWebsite?.trim() || null,
      content: dto.content.trim(),
      parentId: dto.parentId || null,
      articleId: article?.id || null,
      status: CommentStatus.PENDING,
    });
  }

  async findAll(query: QueryCommentDto) {
    return this.commentsRepo.findAll(query);
  }

  async findById(id: string) {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async updateStatus(id: string, status: CommentStatus) {
    await this.findById(id);
    return this.commentsRepo.updateStatus(id, status);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.commentsRepo.delete(id);
  }

  async getStats() {
    return this.commentsRepo.getStats();
  }
}
