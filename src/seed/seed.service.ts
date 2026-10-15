import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extractTableOfContents } from '../common/utils/toc.util';
import {
  SEED_CATEGORIES,
  SEED_PEOPLE,
  SEED_ARTICLES,
} from './seed-data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.autoSeedIfEmpty();
  }

  async autoSeedIfEmpty() {
    try {
      const articleCount = await this.prisma.article.count();

      if (articleCount > 0) {
        this.logger.log(
          `⏩ [SeedService] Database already initialized (${articleCount} articles present). Auto-seed skipped.`,
        );
        return;
      }

      this.logger.log(
        '🌱 [SeedService] Database is empty. Running one-time initial production seed from https://optimark.ai/blog...',
      );

      await this.runSeed();

      this.logger.log(
        '✅ [SeedService] Initial production seeding finished successfully!',
      );
    } catch (error: any) {
      this.logger.error(
        `❌ [SeedService] Auto-seed failed: ${error.message}`,
        error.stack,
      );
    }
  }

  async runSeed() {
    const configuredBase = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
    const normalizeMediaUrl = (url?: string | null): string | undefined => {
      if (!url) return undefined;
      if (!configuredBase) return url;
      return url.replace('https://optimark-staging-media.dritech.co.id', configuredBase);
    };

    // 1. Seed Categories
    const categoryMap = new Map<string, string>();
    for (const cat of SEED_CATEGORIES) {
      const record = await this.prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          nameId: cat.nameId || cat.name,
          nameEn: cat.nameEn || cat.name,
          slugId: cat.slugId,
          slugEn: cat.slugEn,
          description: cat.description,
          descriptionId: cat.descriptionId || cat.description,
          descriptionEn: cat.descriptionEn || cat.description,
          metaTitleId: cat.metaTitleId,
          metaTitleEn: cat.metaTitleEn,
          metaDescriptionId: cat.metaDescriptionId,
          metaDescriptionEn: cat.metaDescriptionEn,
          sortOrder: cat.sortOrder,
        },
        create: {
          name: cat.name,
          nameId: cat.nameId || cat.name,
          nameEn: cat.nameEn || cat.name,
          slug: cat.slug,
          slugId: cat.slugId,
          slugEn: cat.slugEn,
          description: cat.description,
          descriptionId: cat.descriptionId || cat.description,
          descriptionEn: cat.descriptionEn || cat.description,
          metaTitleId: cat.metaTitleId,
          metaTitleEn: cat.metaTitleEn,
          metaDescriptionId: cat.metaDescriptionId,
          metaDescriptionEn: cat.metaDescriptionEn,
          sortOrder: cat.sortOrder,
        },
      });
      categoryMap.set(cat.slug, record.id);
    }
    this.logger.log(`📂 Categories seeded: ${categoryMap.size} categories`);

    // 2. Seed People (Authors & Reviewers E-E-A-T)
    const personMap = new Map<string, string>();
    for (const p of SEED_PEOPLE) {
      const record = await this.prisma.person.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          role: p.role,
          roleId: p.roleId || p.role,
          roleEn: p.roleEn || p.role,
          positionId: p.positionId,
          positionEn: p.positionEn,
          bio: p.bio,
          bioId: p.bioId || p.bio,
          bioEn: p.bioEn || p.bio,
          expertiseId: p.expertiseId || [],
          expertiseEn: p.expertiseEn || [],
          experienceId: p.experienceId as any,
          experienceEn: p.experienceEn as any,
          educationId: p.educationId as any,
          educationEn: p.educationEn as any,
          avatarUrl: normalizeMediaUrl(p.avatarUrl),
          linkedinUrl: p.linkedinUrl,
          type: p.type as any,
        },
        create: {
          name: p.name,
          slug: p.slug,
          role: p.role,
          roleId: p.roleId || p.role,
          roleEn: p.roleEn || p.role,
          positionId: p.positionId,
          positionEn: p.positionEn,
          bio: p.bio,
          bioId: p.bioId || p.bio,
          bioEn: p.bioEn || p.bio,
          expertiseId: p.expertiseId || [],
          expertiseEn: p.expertiseEn || [],
          experienceId: p.experienceId as any,
          experienceEn: p.experienceEn as any,
          educationId: p.educationId as any,
          educationEn: p.educationEn as any,
          avatarUrl: normalizeMediaUrl(p.avatarUrl),
          linkedinUrl: p.linkedinUrl,
          type: p.type as any,
        },
      });
      personMap.set(p.slug, record.id);
    }
    this.logger.log(`👥 People seeded: ${personMap.size} authors/reviewers`);

    // 3. Seed Articles
    let createdCount = 0;
    for (const art of SEED_ARTICLES) {
      const categoryId = categoryMap.get(art.categorySlug);
      const authorId = personMap.get(art.authorSlug);
      const reviewerId = personMap.get(art.reviewerSlug);

      const toc = extractTableOfContents(art.content);

      const article = await this.prisma.article.upsert({
        where: { slug: art.slug },
        update: {
          title: art.title,
          slugId: art.slugId || art.slug,
          slugEn: art.slugEn,
          excerpt: art.excerpt,
          content: art.content,
          metaTitle: art.metaTitle,
          metaDescription: art.metaDescription,
          coverImageUrl: normalizeMediaUrl(art.coverImageUrl),
          coverImageAlt: art.coverImageAlt,
          canonicalUrl: art.canonicalUrl,
          tags: art.tags,
          readMinutes: art.readMinutes,
          status: 'PUBLISHED',
          featured: art.featured,
          tableOfContents: toc as any,
          publishedAt: new Date(art.publishedAt),
          contentUpdatedAt: art.contentUpdatedAt
            ? new Date(art.contentUpdatedAt)
            : new Date(),
          categoryId,
          authorId,
          reviewerId,
        },
        create: {
          title: art.title,
          slug: art.slug,
          slugId: art.slugId || art.slug,
          slugEn: art.slugEn,
          excerpt: art.excerpt,
          content: art.content,
          metaTitle: art.metaTitle,
          metaDescription: art.metaDescription,
          coverImageUrl: normalizeMediaUrl(art.coverImageUrl),
          coverImageAlt: art.coverImageAlt,
          canonicalUrl: art.canonicalUrl,
          tags: art.tags,
          readMinutes: art.readMinutes,
          status: 'PUBLISHED',
          featured: art.featured,
          tableOfContents: toc as any,
          publishedAt: new Date(art.publishedAt),
          contentUpdatedAt: art.contentUpdatedAt
            ? new Date(art.contentUpdatedAt)
            : new Date(),
          categoryId,
          authorId,
          reviewerId,
        },
      });

      // Seed Bilingual Translations
      if (art.translations) {
        for (const locale of ['id', 'en'] as const) {
          const tr = art.translations[locale];
          if (tr) {
            await this.prisma.articleTranslation.upsert({
              where: {
                articleId_locale: {
                  articleId: article.id,
                  locale,
                },
              },
              update: {
                title: tr.title,
                slug: tr.slug,
                excerpt: tr.excerpt,
                content: tr.content,
                metaTitle: tr.metaTitle,
                metaDescription: tr.metaDescription,
              },
              create: {
                articleId: article.id,
                locale,
                title: tr.title,
                slug: tr.slug,
                excerpt: tr.excerpt,
                content: tr.content,
                metaTitle: tr.metaTitle,
                metaDescription: tr.metaDescription,
              },
            });
          }
        }
      }

      createdCount++;
    }

    this.logger.log(`📝 Articles seeded: ${createdCount} published articles`);
  }
}
