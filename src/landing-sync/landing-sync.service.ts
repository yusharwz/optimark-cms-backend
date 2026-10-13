import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { markdownToBlocks } from '../common/utils/markdown-to-blocks.util';
import slugify from 'slugify';

export interface SyncArticleInput {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  tags?: string[];
  readMinutes?: number;
  status: string;
  featured?: boolean;
  publishedAt?: Date | null;
  contentUpdatedAt?: Date | null;
  createdAt?: Date;
  category?: any;
  author?: any;
  reviewer?: any;
  translations?:
    | Array<{
        locale: string;
        title: string;
        excerpt?: string | null;
        content: string;
        metaTitle?: string | null;
        metaDescription?: string | null;
      }>
    | {
        id?: any;
        en?: any;
      };
}

@Injectable()
export class LandingSyncService {
  private readonly logger = new Logger(LandingSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sanitizes and normalizes slug to strict URL-friendly kebab-case lowercase.
   */
  normalizeSlug(raw: string): string {
    return slugify(raw, { lower: true, strict: true, trim: true }) || 'post';
  }

  /**
   * Ensures the category exists in optimark_landing.blog_categories.
   */
  private async ensureCategory(categorySlug: string, categoryName: string): Promise<string> {
    const slug = this.normalizeSlug(categorySlug);
    const existing = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM optimark_landing.blog_categories WHERE slug = $1 LIMIT 1`,
      slug,
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    const catId = slug;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO optimark_landing.blog_categories (id, slug, sort_order, created_at, updated_at)
       VALUES ($1, $2, 0, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, updated_at = NOW()`,
      catId,
      slug,
    );

    // Insert translations for both locales
    for (const locale of ['id', 'en']) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_category_translations (id, category_id, locale, name)
         VALUES ($1, $2, $3::"Locale", $4)
         ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name`,
        `trans_${catId}_${locale}`,
        catId,
        locale,
        categoryName,
      );
    }

    return catId;
  }

  /**
   * Ensures the author or reviewer exists in optimark_landing.blog_people.
   */
  private async ensurePerson(
    personSlug: string,
    personName: string,
    avatarUrl?: string | null,
    role = 'Editorial Staff',
  ): Promise<string> {
    const slug = this.normalizeSlug(personSlug);
    const existing = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM optimark_landing.blog_people WHERE slug = $1 LIMIT 1`,
      slug,
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    const personId = slug;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO optimark_landing.blog_people (id, slug, name, avatar_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()`,
      personId,
      slug,
      personName,
      avatarUrl || null,
    );

    for (const locale of ['id', 'en']) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_person_translations (id, person_id, locale, role, bio)
         VALUES ($1, $2, $3::"Locale", $4, $5)
         ON CONFLICT (person_id, locale) DO UPDATE SET role = EXCLUDED.role`,
        `trans_${personId}_${locale}`,
        personId,
        locale,
        role,
        `${personName} adalah kontributor konten Optimark.`,
      );
    }

    return personId;
  }

  /**
   * Synchronizes an article from CMS to optimark_landing.blog_posts & translations.
   */
  async syncArticle(input: SyncArticleInput): Promise<string> {
    const slug = this.normalizeSlug(input.slug);
    const now = new Date();

    // Map status: only PUBLISHED gets pulled into sitemap XML
    let landingStatus = 'DRAFT';
    if (input.status === 'PUBLISHED') {
      landingStatus = 'PUBLISHED';
    } else if (input.status === 'ARCHIVED') {
      landingStatus = 'ARCHIVED';
    }

    const publishedAt =
      landingStatus === 'PUBLISHED' ? input.publishedAt || now : null;

    // content_updated_at is mandatory for <lastmod> tag in /sitemap.xml
    const contentUpdatedAt = input.contentUpdatedAt || now;

    // Resolve Category
    let categoryId = 'seo';
    if (input.category) {
      categoryId = await this.ensureCategory(input.category.slug, input.category.name);
    }

    // Resolve Author
    let authorId = 'rafi-rizky';
    if (input.author) {
      authorId = await this.ensurePerson(
        input.author.slug,
        input.author.name,
        input.author.avatarUrl,
        input.author.role,
      );
    }

    // Resolve Reviewer
    let reviewerId: string | null = null;
    if (input.reviewer) {
      reviewerId = await this.ensurePerson(
        input.reviewer.slug,
        input.reviewer.name,
        input.reviewer.avatarUrl,
        input.reviewer.role,
      );
    }

    const postId = `post_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;

    this.logger.log(
      `📥 Syncing article to optimark_landing.blog_posts: [${landingStatus}] ${slug}`,
    );

    // Upsert into optimark_landing.blog_posts
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO optimark_landing.blog_posts (
        id, external_id, slug, status, category_id, author_id, reviewer_id,
        cover_image_url, cover_image_alt, read_minutes, featured,
        published_at, content_updated_at, created_at, updated_at,
        canonical_url, tags
      ) VALUES (
        $1, $2, $3, $4::"BlogPostStatus", $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17
      )
      ON CONFLICT (slug) DO UPDATE SET
        external_id = EXCLUDED.external_id,
        status = EXCLUDED.status,
        category_id = EXCLUDED.category_id,
        author_id = EXCLUDED.author_id,
        reviewer_id = EXCLUDED.reviewer_id,
        cover_image_url = EXCLUDED.cover_image_url,
        cover_image_alt = EXCLUDED.cover_image_alt,
        read_minutes = EXCLUDED.read_minutes,
        featured = EXCLUDED.featured,
        published_at = EXCLUDED.published_at,
        content_updated_at = EXCLUDED.content_updated_at,
        updated_at = EXCLUDED.updated_at,
        canonical_url = EXCLUDED.canonical_url,
        tags = EXCLUDED.tags`,
      postId,
      input.id,
      slug,
      landingStatus,
      categoryId,
      authorId,
      reviewerId,
      input.coverImageUrl || null,
      input.coverImageAlt || null,
      input.readMinutes || 3,
      input.featured ?? false,
      publishedAt,
      contentUpdatedAt,
      input.createdAt || now,
      now,
      input.canonicalUrl || null,
      input.tags || [],
    );

    // Upsert translations for 'id' and 'en'
    for (const locale of ['id', 'en']) {
      let trData: any = null;
      if (Array.isArray(input.translations)) {
        trData = input.translations.find((t) => t.locale === locale);
      } else if (input.translations && (input.translations as any)[locale]) {
        trData = (input.translations as any)[locale];
      }

      const trTitle = trData?.title || input.title;
      const trExcerpt = trData?.excerpt || input.excerpt || '';
      const trMetaTitle = trData?.metaTitle || input.metaTitle || trTitle;
      const trMetaDesc = trData?.metaDescription || input.metaDescription || trExcerpt || '';
      const trContent = trData?.content || input.content;

      const blocks = markdownToBlocks(trContent);
      const bodyJson = JSON.stringify(blocks);

      await this.prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_post_translations (
          id, post_id, locale, title, excerpt, meta_title, meta_description, body
        ) VALUES (
          $1, $2, $3::"Locale", $4, $5, $6, $7, $8::jsonb
        )
        ON CONFLICT (post_id, locale) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          body = EXCLUDED.body`,
        `trans_${postId}_${locale}`,
        postId,
        locale,
        trTitle,
        trExcerpt,
        trMetaTitle,
        trMetaDesc,
        bodyJson,
      );
    }

    this.logger.log(
      `✅ [LandingSync] Article '${slug}' successfully synced with status '${landingStatus}' and content_updated_at '${contentUpdatedAt.toISOString()}'.`,
    );

    return slug;
  }

  /**
   * Sets the article status to DRAFT in optimark_landing, effectively removing it from sitemap.
   */
  async unpublishArticle(slug: string): Promise<void> {
    const normalized = this.normalizeSlug(slug);
    await this.prisma.$executeRawUnsafe(
      `UPDATE optimark_landing.blog_posts
       SET status = 'DRAFT'::"BlogPostStatus", content_updated_at = NOW(), updated_at = NOW()
       WHERE slug = $1`,
      normalized,
    );
    this.logger.log(`🛑 [LandingSync] Article '${normalized}' set to DRAFT in optimark_landing.`);
  }

  /**
   * Permanently removes an article from optimark_landing.blog_posts.
   */
  async deleteArticle(slug: string): Promise<void> {
    const normalized = this.normalizeSlug(slug);
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM optimark_landing.blog_posts WHERE slug = $1`,
      normalized,
    );
    this.logger.log(`🗑️ [LandingSync] Article '${normalized}' deleted from optimark_landing.`);
  }
}
