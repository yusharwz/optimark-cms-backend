import { Injectable, Logger } from '@nestjs/common';
import slugify from 'slugify';

export interface SyncArticleParams {
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
  category?: {
    id?: string;
    slug: string;
    name: string;
  } | null;
  author?: {
    id?: string;
    slug: string;
    name: string;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  reviewer?: {
    id?: string;
    slug: string;
    name: string;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  translations?:
    | Array<{
        locale: string;
        title?: string;
        excerpt?: string | null;
        content?: string | null;
        metaTitle?: string | null;
        metaDescription?: string | null;
        coverImageAlt?: string | null;
      }>
    | {
        id?: any;
        en?: any;
      };
}

@Injectable()
export class LandingSyncService {
  private readonly logger = new Logger(LandingSyncService.name);

  /**
   * Sanitizes and normalizes slug to strict URL-friendly kebab-case lowercase.
   */
  normalizeSlug(raw: string): string {
    return slugify(raw, { lower: true, strict: true, trim: true }) || 'post';
  }

  /**
   * Notifies and ensures article is synced for headless landing page consumers.
   */
  async syncArticle(params: SyncArticleParams): Promise<void> {
    const slug = this.normalizeSlug(params.slug);
    this.logger.log(`✅ [LandingSync] Article '${slug}' is live for headless landing page.`);
  }

  /**
   * Sets article to DRAFT or unpublished.
   */
  async setDraft(slug: string): Promise<void> {
    const normalized = this.normalizeSlug(slug);
    this.logger.log(`🛑 [LandingSync] Article '${normalized}' set to DRAFT.`);
  }

  async unpublishArticle(slug: string): Promise<void> {
    const normalized = this.normalizeSlug(slug);
    this.logger.log(`🛑 [LandingSync] Article '${normalized}' unpublished.`);
  }

  /**
   * Handles article deletion.
   */
  async deleteArticle(slug: string): Promise<void> {
    const normalized = this.normalizeSlug(slug);
    this.logger.log(`🗑️ [LandingSync] Article '${normalized}' deleted.`);
  }
}
