import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { RedirectsService } from '../redirects/redirects.service';
import { LandingSyncService } from '../landing-sync/landing-sync.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { extractTableOfContents, calculateReadMinutes } from '../common/utils/toc.util';
import { ArticleStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    private readonly repository: ArticlesRepository,
    private readonly redirectsService: RedirectsService,
    private readonly landingSyncService: LandingSyncService,
    private readonly revalidationService: RevalidationService,
    private readonly prisma: PrismaService,
  ) {}

  private async generateUniqueSlug(title: string, customSlug?: string, excludeId?: string): Promise<string> {
    const raw = customSlug || title;
    const baseSlug = slugify(raw, { lower: true, strict: true, trim: true }) || 'post';
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

  private async resolveCategoryId(categoryIdOrSlug?: string): Promise<string | undefined> {
    if (!categoryIdOrSlug) return undefined;
    const cat = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryIdOrSlug }, { slug: categoryIdOrSlug }],
      },
    });
    return cat?.id || categoryIdOrSlug;
  }

  private async resolvePersonId(personIdOrSlug?: string): Promise<string | undefined> {
    if (!personIdOrSlug) return undefined;
    const person = await this.prisma.person.findFirst({
      where: {
        OR: [{ id: personIdOrSlug }, { slug: personIdOrSlug }],
      },
    });
    return person?.id || personIdOrSlug;
  }

  private async syncAndRevalidate(article: any) {
    try {
      await this.landingSyncService.syncArticle({
        id: article.id,
        title: article.title,
        slug: article.slug,
        slugId: article.slugId,
        slugEn: article.slugEn,
        excerpt: article.excerpt,
        content: article.content,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        canonicalUrl: article.canonicalUrl,
        coverImageUrl: article.coverImageUrl,
        coverImageAlt: article.coverImageAlt,
        tags: article.tags,
        readMinutes: article.readMinutes,
        status: article.status,
        featured: article.featured,
        publishedAt: article.publishedAt,
        contentUpdatedAt: article.contentUpdatedAt || new Date(),
        createdAt: article.createdAt,
        category: article.category,
        author: article.author,
        reviewer: article.reviewer,
        translations: article.translations,
        });

      await this.revalidationService.revalidateArticle(article.slug);
    } catch (err: any) {
      this.logger.error(`[ArticlesService] Sync/Revalidation error for '${article.slug}': ${err.message}`, err.stack);
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

    const categoryId = await this.resolveCategoryId(dto.categoryId);
    const authorId = await this.resolvePersonId(dto.authorId);
    const reviewerId = await this.resolvePersonId(dto.reviewerId);

    const slugId = dto.slugId || dto.translations?.id?.slug || slug;
    const slugEn = dto.slugEn || dto.translations?.en?.slug || undefined;

    const data: Prisma.ArticleCreateInput = {
      title: dto.title,
      slug,
      slugId,
      slugEn,
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
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      author: authorId ? { connect: { id: authorId } } : undefined,
      reviewer: reviewerId ? { connect: { id: reviewerId } } : undefined,
    };

    const created = await this.repository.create(data);

    if (dto.translations) {
      for (const locale of ['id', 'en'] as const) {
        const tr = dto.translations[locale];
        if (tr && (tr.title || tr.content)) {
          const transSlug = tr.slug || (locale === 'id' ? slugId : slugEn);
          await this.prisma.articleTranslation.upsert({
            where: {
              articleId_locale: {
                articleId: created.id,
                locale,
              },
            },
            update: {
              title: tr.title || created.title,
              slug: transSlug,
              excerpt: tr.excerpt ?? created.excerpt,
              content: tr.content || created.content,
              metaTitle: tr.metaTitle ?? created.metaTitle,
              metaDescription: tr.metaDescription ?? created.metaDescription,
            },
            create: {
              articleId: created.id,
              locale,
              title: tr.title || created.title,
              slug: transSlug,
              excerpt: tr.excerpt ?? created.excerpt,
              content: tr.content || created.content,
              metaTitle: tr.metaTitle ?? created.metaTitle,
              metaDescription: tr.metaDescription ?? created.metaDescription,
            },
          });
        }
      }
    }

    const fullArticle = await this.findById(created.id);
    await this.syncMediaAltFromArticle(fullArticle.coverImageUrl, fullArticle.coverImageAlt, [
      fullArticle.content,
      dto.translations?.id?.content,
      dto.translations?.en?.content,
    ]);
    await this.syncAndRevalidate(fullArticle);

    return fullArticle;
  }

  async findAll(query: QueryArticleDto) {
    const { search, status, categoryId, authorId, page = 1, limit = 25 } = query;
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
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

    if (dto.saveAsRevision && current.status === ArticleStatus.PUBLISHED) {
      const draftPayload = {
        title: dto.title ?? current.title,
        slug: dto.slug ?? current.slug,
        excerpt: dto.excerpt ?? current.excerpt,
        content: dto.content ?? current.content,
        metaTitle: dto.metaTitle ?? current.metaTitle,
        metaDescription: dto.metaDescription ?? current.metaDescription,
        canonicalUrl: dto.canonicalUrl ?? current.canonicalUrl,
        coverImageUrl: dto.coverImageUrl ?? current.coverImageUrl,
        coverImageAlt: dto.coverImageAlt ?? current.coverImageAlt,
        tags: dto.tags ?? current.tags,
        categoryId: dto.categoryId ?? current.categoryId,
        authorId: dto.authorId ?? current.authorId,
        reviewerId: dto.reviewerId ?? current.reviewerId,
        translations: dto.translations,
        updatedAt: new Date().toISOString(),
      };

      await this.repository.update(id, {
        draftData: draftPayload as unknown as Prisma.InputJsonValue,
      });
      return this.findById(id);
    }

    let slug = current.slug;
    const oldSlug = current.slug;
    if (dto.slug && dto.slug !== current.slug) {
      slug = await this.generateUniqueSlug(dto.title || current.title, dto.slug, id);
      if (current.status === ArticleStatus.PUBLISHED) {
        await this.redirectsService.recordSlugChange(current.slug, slug);
      }
    }

    const oldSlugId = current.slugId || current.slug;
    const oldSlugEn = current.slugEn;

    let slugId = dto.slugId ?? dto.translations?.id?.slug;
    if (slugId === undefined) {
      slugId = dto.slug ? slug : current.slugId || slug;
    }

    let slugEn = dto.slugEn ?? dto.translations?.en?.slug;
    if (slugEn === undefined) {
      slugEn = current.slugEn ?? undefined;
    }

    if (current.status === ArticleStatus.PUBLISHED) {
      if (slugId && oldSlugId && slugId !== oldSlugId) {
        await this.redirectsService.recordSlugChange(oldSlugId, slugId);
      }
      if (slugEn && oldSlugEn && slugEn !== oldSlugEn) {
        await this.redirectsService.recordSlugChange(oldSlugEn, slugEn);
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

    const categoryId = dto.categoryId !== undefined ? await this.resolveCategoryId(dto.categoryId) : undefined;
    const authorId = dto.authorId !== undefined ? await this.resolvePersonId(dto.authorId) : undefined;
    const reviewerId = dto.reviewerId !== undefined ? await this.resolvePersonId(dto.reviewerId) : undefined;

    const data: Prisma.ArticleUpdateInput = {
      ...(dto.title ? { title: dto.title } : {}),
      slug,
      slugId,
      slugEn,
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
      draftData: Prisma.DbNull,
      publishedAt,
      scheduledAt,
      contentUpdatedAt: new Date(),
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      author: authorId ? { connect: { id: authorId } } : undefined,
      reviewer: reviewerId !== undefined ? (reviewerId ? { connect: { id: reviewerId } } : { disconnect: true }) : undefined,
    };

    const updated = await this.repository.update(id, data);

    if (dto.translations) {
      for (const locale of ['id', 'en'] as const) {
        const tr = dto.translations[locale];
        if (tr) {
          const transSlug = tr.slug || (locale === 'id' ? slugId : slugEn);
          await this.prisma.articleTranslation.upsert({
            where: {
              articleId_locale: {
                articleId: id,
                locale,
              },
            },
            update: {
              ...(tr.title ? { title: tr.title } : {}),
              ...(transSlug ? { slug: transSlug } : {}),
              ...(tr.excerpt !== undefined ? { excerpt: tr.excerpt } : {}),
              ...(tr.content ? { content: tr.content } : {}),
              ...(tr.metaTitle !== undefined ? { metaTitle: tr.metaTitle } : {}),
              ...(tr.metaDescription !== undefined ? { metaDescription: tr.metaDescription } : {}),
            },
            create: {
              articleId: id,
              locale,
              title: tr.title || updated.title,
              slug: transSlug,
              excerpt: tr.excerpt ?? updated.excerpt,
              content: tr.content || updated.content,
              metaTitle: tr.metaTitle ?? updated.metaTitle,
              metaDescription: tr.metaDescription ?? updated.metaDescription,
            },
          });
        }
      }
    }

    const fullArticle = await this.findById(id);
    await this.syncMediaAltFromArticle(fullArticle.coverImageUrl, fullArticle.coverImageAlt, [
      fullArticle.content,
      dto.translations?.id?.content,
      dto.translations?.en?.content,
    ]);
    await this.syncAndRevalidate(fullArticle);

    if (oldSlug !== updated.slug) {
      await this.landingSyncService.deleteArticle(oldSlug);
      await this.revalidationService.revalidateArticle(oldSlug);
    }

    return fullArticle;
  }

  async publishNow(id: string) {
    const article = await this.findById(id);
    const now = new Date();

    const updated = await this.repository.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: article.publishedAt || now,
      contentUpdatedAt: now,
      scheduledAt: null,
    });

    await this.syncAndRevalidate(updated);
    return updated;
  }

  async unpublish(id: string) {
    const article = await this.findById(id);
    const updated = await this.repository.update(id, {
      status: ArticleStatus.DRAFT,
      scheduledAt: null,
      contentUpdatedAt: new Date(),
    });

    await this.landingSyncService.unpublishArticle(article.slug);
    await this.revalidationService.revalidateArticle(article.slug);

    return updated;
  }

  async remove(id: string) {
    const article = await this.findById(id);
    await this.landingSyncService.deleteArticle(article.slug);
    await this.revalidationService.revalidateArticle(article.slug);
    return this.repository.delete(id);
  }

  async processScheduledPublishing() {
    const now = new Date();
    const dueArticles = await this.repository.findDueScheduled(now);

    for (const article of dueArticles) {
      const updated = await this.repository.update(article.id, {
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.scheduledAt || now,
        contentUpdatedAt: now,
        scheduledAt: null,
      });

      await this.syncAndRevalidate(updated);
      this.logger.log(`[ArticlesScheduler] Automatically published article '${article.title}' (${article.id})`);
    }

    return dueArticles.length;
  }

  private async syncMediaAltFromArticle(
    coverImageUrl?: string | null,
    coverImageAlt?: string | null,
    contents: (string | null | undefined)[] = [],
  ) {
    try {
      if (coverImageUrl && coverImageAlt?.trim()) {
        await this.updateMediaAltByUrlOrFilename(coverImageUrl, coverImageAlt.trim());
      }

      for (const content of contents) {
        if (!content) continue;
        const matches = content.matchAll(/!\[(.*?)\]\((.*?)\)/g);
        for (const m of matches) {
          const alt = m[1]?.trim();
          const url = m[2]?.trim();
          if (alt && url) {
            await this.updateMediaAltByUrlOrFilename(url, alt);
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`[SyncMediaAltFromArticle Notice]: ${err.message}`);
    }
  }

  private async updateMediaAltByUrlOrFilename(urlOrFilename: string, altText: string) {
    try {
      const filename = urlOrFilename.split('/').pop()?.split('?')[0] || urlOrFilename;
      const media = await this.prisma.media.findFirst({
        where: {
          OR: [
            { url: urlOrFilename },
            { key: { endsWith: filename } },
            { filename },
          ],
        },
      });
      if (media && media.altText !== altText) {
        await this.prisma.media.update({
          where: { id: media.id },
          data: { altText },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to auto-sync media alt for ${urlOrFilename}: ${err.message}`);
    }
  }
}
