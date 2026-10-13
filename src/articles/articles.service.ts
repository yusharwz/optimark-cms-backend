import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { RedirectsService } from '../redirects/redirects.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { extractTableOfContents, calculateReadMinutes } from '../common/utils/toc.util';
import { ArticleStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly repository: ArticlesRepository,
    private readonly redirectsService: RedirectsService,
  ) {}

  private async generateUniqueSlug(title: string, customSlug?: string, excludeId?: string): Promise<string> {
    const raw = customSlug || title;
    const baseSlug = slugify(raw, { lower: true, strict: true }) || 'post';
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.repository.findBySlug(slug);
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreateArticleDto) {
    const slug = await this.generateUniqueSlug(dto.title, dto.slug);
    const toc = extractTableOfContents(dto.content);
    const readMinutes = dto.readMinutes || calculateReadMinutes(dto.content);

    let status = dto.status || ArticleStatus.DRAFT;
    let publishedAt: Date | null = dto.publishedAt ? new Date(dto.publishedAt) : null;
    let scheduledAt: Date | null = dto.scheduledAt ? new Date(dto.scheduledAt) : null;

    if (scheduledAt && scheduledAt > new Date()) {
      status = ArticleStatus.SCHEDULED;
    } else if (status === ArticleStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    const data: Prisma.ArticleCreateInput = {
      title: dto.title,
      slug,
      excerpt: dto.excerpt,
      content: dto.content,
      metaTitle: dto.metaTitle || dto.title,
      metaDescription: dto.metaDescription || dto.excerpt,
      canonicalUrl: dto.canonicalUrl,
      coverImageUrl: dto.coverImageUrl,
      coverImageAlt: dto.coverImageAlt,
      tags: dto.tags || [],
      readMinutes,
      status,
      featured: dto.featured ?? false,
      tableOfContents: toc as unknown as Prisma.InputJsonValue,
      publishedAt,
      scheduledAt,
      contentUpdatedAt: publishedAt ? new Date() : null,
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
      author: dto.authorId ? { connect: { id: dto.authorId } } : undefined,
      reviewer: dto.reviewerId ? { connect: { id: dto.reviewerId } } : undefined,
    };

    return this.repository.create(data);
  }

  async findAll(query: QueryArticleDto) {
    const { search, status, categoryId, authorId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(authorId ? { authorId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.repository.findAll({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const article = await this.repository.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID '${id}' not found.`);
    }
    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.repository.findBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found.`);
    }
    return article;
  }

  async findByPreviewToken(token: string) {
    const article = await this.repository.findByPreviewToken(token);
    if (!article) {
      throw new NotFoundException(`Preview article with token '${token}' not found.`);
    }
    return article;
  }

  async update(id: string, dto: UpdateArticleDto) {
    const current = await this.findById(id);

    let slug = current.slug;
    if (dto.slug && dto.slug !== current.slug) {
      slug = await this.generateUniqueSlug(dto.title || current.title, dto.slug, id);
      // Auto-record 301 redirect if article was published
      if (current.status === ArticleStatus.PUBLISHED) {
        await this.redirectsService.recordSlugChange(current.slug, slug);
      }
    }

    const content = dto.content !== undefined ? dto.content : current.content;
    const toc = extractTableOfContents(content);
    const readMinutes = dto.readMinutes || calculateReadMinutes(content);

    let status = dto.status || current.status;
    let publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : current.publishedAt;
    let scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : current.scheduledAt;

    if (dto.scheduledAt && new Date(dto.scheduledAt) > new Date()) {
      status = ArticleStatus.SCHEDULED;
    } else if (status === ArticleStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    const data: Prisma.ArticleUpdateInput = {
      ...(dto.title ? { title: dto.title } : {}),
      slug,
      ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
      content,
      ...(dto.metaTitle !== undefined ? { metaTitle: dto.metaTitle } : {}),
      ...(dto.metaDescription !== undefined ? { metaDescription: dto.metaDescription } : {}),
      ...(dto.canonicalUrl !== undefined ? { canonicalUrl: dto.canonicalUrl } : {}),
      ...(dto.coverImageUrl !== undefined ? { coverImageUrl: dto.coverImageUrl } : {}),
      ...(dto.coverImageAlt !== undefined ? { coverImageAlt: dto.coverImageAlt } : {}),
      ...(dto.tags ? { tags: dto.tags } : {}),
      readMinutes,
      status,
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      tableOfContents: toc as unknown as Prisma.InputJsonValue,
      publishedAt,
      scheduledAt,
      contentUpdatedAt: new Date(),
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
      author: dto.authorId ? { connect: { id: dto.authorId } } : undefined,
      reviewer: dto.reviewerId !== undefined ? (dto.reviewerId ? { connect: { id: dto.reviewerId } } : { disconnect: true }) : undefined,
    };

    return this.repository.update(id, data);
  }

  async publishNow(id: string) {
    const article = await this.findById(id);
    const now = new Date();

    return this.repository.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: article.publishedAt || now,
      contentUpdatedAt: now,
      scheduledAt: null,
    });
  }

  async unpublish(id: string) {
    await this.findById(id);
    return this.repository.update(id, {
      status: ArticleStatus.DRAFT,
      scheduledAt: null,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  /**
   * Cron worker function: publish scheduled articles whose scheduledAt <= now
   */
  async processScheduledPublishing() {
    const now = new Date();
    const dueArticles = await this.repository.findDueScheduled(now);

    for (const article of dueArticles) {
      await this.repository.update(article.id, {
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.scheduledAt || now,
        contentUpdatedAt: now,
        scheduledAt: null,
      });
      console.log(`[ArticlesScheduler] Automatically published article '${article.title}' (${article.id})`);
    }

    return dueArticles.length;
  }
}
