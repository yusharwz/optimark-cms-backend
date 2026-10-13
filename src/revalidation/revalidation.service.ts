import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly revalidateUrl =
    process.env.LANDING_PAGE_REVALIDATE_URL || 'http://localhost:3000/api/revalidate';
  private readonly secret =
    process.env.REVALIDATE_SECRET || 'optimark_cms_revalidate_secret_2026';

  /**
   * Triggers ISR cache revalidation for one or more paths on the landing page.
   * Ensures instant sync for Googlebot and users without waiting for ISR intervals.
   */
  async revalidatePaths(paths: string[]): Promise<void> {
    if (!this.revalidateUrl || !this.secret) {
      this.logger.warn('Revalidation URL or SECRET is not configured. Skipping revalidation.');
      return;
    }

    const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
    this.logger.log(`🔄 Triggering on-demand revalidation for ${uniquePaths.length} path(s)...`);

    for (const path of uniquePaths) {
      try {
        const response = await fetch(this.revalidateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-secret': this.secret,
          },
          body: JSON.stringify({
            path,
            secret: this.secret,
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          this.logger.log(`✅ [Revalidate] Path '${path}' successfully revalidated.`);
        } else {
          const errorText = await response.text();
          this.logger.warn(
            `⚠️ [Revalidate] Failed for path '${path}' (${response.status}): ${errorText}`,
          );
        }
      } catch (err: any) {
        this.logger.error(`❌ [Revalidate] Network error revalidating '${path}': ${err.message}`);
      }
    }
  }

  /**
   * Revalidates all routes affected by an article change:
   * - /sitemap.xml
   * - /blog-sitemap.xml
   * - /sitemap_index.xml
   * - /blog
   * - /blog/{slug}
   * - Localized paths (/id/blog, /en/blog, etc.)
   */
  async revalidateArticle(slug: string): Promise<void> {
    const paths = [
      '/sitemap.xml',
      '/blog-sitemap.xml',
      '/sitemap_index.xml',
      '/blog',
      `/blog/${slug}`,
      '/id/blog',
      `/id/blog/${slug}`,
      '/en/blog',
      `/en/blog/${slug}`,
    ];

    await this.revalidatePaths(paths);
  }
}
