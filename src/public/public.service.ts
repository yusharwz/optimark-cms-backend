import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEED_CATEGORIES, SEED_PEOPLE, SEED_ARTICLES } from '../seed/seed-data';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedPosts(params: {
    categorySlug?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    locale?: string;
  }) {
    const { categorySlug, tag, search, page = 1, limit = 12, locale } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (categorySlug) {
      where.category = {
        OR: [{ slug: categorySlug }, { slugId: categorySlug }, { slugEn: categorySlug }],
      };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          slugId: true,
          slugEn: true,
          excerpt: true,
          coverImageUrl: true,
          coverImageAlt: true,
          readMinutes: true,
          featured: true,
          tags: true,
          publishedAt: true,
          contentUpdatedAt: true,
          translations: {
            select: {
              locale: true,
              title: true,
              slug: true,
              excerpt: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true, slugId: true, slugEn: true },
          },
          author: {
            select: { id: true, name: true, slug: true, role: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    const targetLocale = (locale || 'id').toLowerCase();
    const mappedItems = items.map((item) => {
      const tr = item.translations?.find((t) => t.locale === targetLocale);
      const idSlug = item.slugId || item.slug;
      const enSlug = item.slugEn || item.slug;
      const localizedSlug = targetLocale === 'en' ? enSlug : idSlug;

      return {
        ...item,
        title: tr?.title || item.title,
        slug: localizedSlug,
        slugId: idSlug,
        slugEn: enSlug,
        excerpt: tr?.excerpt || item.excerpt,
        alternateSlugs: {
          id: idSlug,
          en: enSlug,
        },
      };
    });

    return {
      data: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostBySlug(slug: string, locale?: string) {
    const post = await this.prisma.article.findFirst({
      where: {
        OR: [
          { slug },
          { slugId: slug },
          { slugEn: slug },
          { translations: { some: { slug } } },
        ],
      },
      include: {
        category: true,
        author: true,
        reviewer: true,
        translations: true,
      },
    });

    if (!post || post.status !== ArticleStatus.PUBLISHED) {
      // Check if there is a 301 redirect for this slug
      const redirect = await this.prisma.redirect.findFirst({
        where: {
          OR: [
            { sourcePath: `/blog/${slug}` },
            { sourcePath: `/id/blog/${slug}` },
            { sourcePath: `/en/blog/${slug}` },
          ],
        },
      });
      if (redirect && redirect.active) {
        return {
          redirect: {
            targetPath: redirect.targetPath,
            statusCode: redirect.statusCode,
          },
        };
      }
      throw new NotFoundException(`Published post with slug '${slug}' not found.`);
    }

    const idSlug = post.slugId || post.slug;
    const enSlug = post.slugEn || post.slug;
    const targetLocale = (locale || 'id').toLowerCase();
    const canonicalSlug = targetLocale === 'en' ? enSlug : idSlug;

    // Canonical redirect enforcement if requested with mismatched slug for the specified locale
    if (locale && slug !== canonicalSlug) {
      return {
        redirect: {
          targetPath: targetLocale === 'en' ? `/en/blog/${canonicalSlug}` : `/blog/${canonicalSlug}`,
          statusCode: 301,
        },
      };
    }

    // Resolve localized content for requested locale
    const tr = post.translations?.find((t) => t.locale === targetLocale);
    const resolvedPost = {
      ...post,
      title: tr?.title || post.title,
      slug: canonicalSlug,
      slugId: idSlug,
      slugEn: enSlug,
      excerpt: tr?.excerpt || post.excerpt,
      content: tr?.content || post.content,
      metaTitle: tr?.metaTitle || post.metaTitle,
      metaDescription: tr?.metaDescription || post.metaDescription,
      alternateSlugs: {
        id: idSlug,
        en: enSlug,
      },
      translations: (post.translations || []).map((t) => ({
        locale: t.locale,
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
      })),
    };
    delete (resolvedPost as any).draftData;

    // Fetch related posts from the same category
    const relatedPosts = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        categoryId: post.categoryId,
        id: { not: post.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        slugId: true,
        slugEn: true,
        excerpt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        publishedAt: true,
        readMinutes: true,
        translations: {
          select: {
            locale: true,
            title: true,
            slug: true,
            excerpt: true,
          },
        },
      },
    });

    const mappedRelatedPosts = relatedPosts.map((rel) => {
      const relTr = rel.translations?.find((t) => t.locale === targetLocale);
      const relIdSlug = rel.slugId || rel.slug;
      const relEnSlug = rel.slugEn || rel.slug;
      return {
        ...rel,
        title: relTr?.title || rel.title,
        slug: targetLocale === 'en' ? relEnSlug : relIdSlug,
        slugId: relIdSlug,
        slugEn: relEnSlug,
        excerpt: relTr?.excerpt || rel.excerpt,
        alternateSlugs: {
          id: relIdSlug,
          en: relEnSlug,
        },
      };
    });

    return { post: resolvedPost, relatedPosts: mappedRelatedPosts };
  }

  async getPreviewByToken(previewToken: string) {
    const post = await this.prisma.article.findUnique({
      where: { previewToken },
      include: {
        category: true,
        author: true,
        reviewer: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Preview post with token '${previewToken}' not found.`);
    }

    return post;
  }

  async getAuthorProfile(slug: string) {
    const person = await this.prisma.person.findUnique({
      where: { slug },
      include: {
        authoredArticles: {
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImageUrl: true,
            publishedAt: true,
            readMinutes: true,
          },
        },
        reviewedArticles: {
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImageUrl: true,
            publishedAt: true,
            readMinutes: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Author/Reviewer with slug '${slug}' not found.`);
    }

    return person;
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ slug }, { slugId: slug }, { slugEn: slug }],
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }
    return category;
  }

  async syncSeed() {
    for (const cat of SEED_CATEGORIES) {
      await this.prisma.category.upsert({
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
    }

    for (const p of SEED_PEOPLE) {
      await this.prisma.person.upsert({
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
          avatarUrl: p.avatarUrl,
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
          avatarUrl: p.avatarUrl,
          linkedinUrl: p.linkedinUrl,
          type: p.type as any,
        },
      });
    }

    for (const art of SEED_ARTICLES) {
      const existing = await this.prisma.article.findUnique({
        where: { slug: art.slug },
      });
      if (existing) {
        await this.prisma.article.update({
          where: { id: existing.id },
          data: {
            slugId: art.slugId || art.slug,
            slugEn: art.slugEn,
          },
        });

        if (art.translations) {
          for (const loc of ['id', 'en'] as const) {
            const tr = art.translations[loc];
            if (tr) {
              await this.prisma.articleTranslation.upsert({
                where: {
                  articleId_locale: {
                    articleId: existing.id,
                    locale: loc,
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
                  articleId: existing.id,
                  locale: loc,
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
      }
    }

    // Backfill any articles with null slugId
    const otherArticles = await this.prisma.article.findMany({
      where: { slugId: null },
      select: { id: true, slug: true },
    });
    for (const o of otherArticles) {
      await this.prisma.article.update({
        where: { id: o.id },
        data: { slugId: o.slug },
      });
    }

    return { success: true, message: 'Taxonomy, People, and Articles synchronized with bilingual seed data' };
  }

  async getActiveRedirects() {
    return this.prisma.redirect.findMany({
      where: { active: true },
      select: {
        sourcePath: true,
        targetPath: true,
        statusCode: true,
      },
    });
  }

  async generateSitemapXml(siteUrl = 'https://optimark.ai'): Promise<string> {
    const posts = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true,
        slugId: true,
        slugEn: true,
        publishedAt: true,
        contentUpdatedAt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        title: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      select: { slug: true, slugId: true, slugEn: true, updatedAt: true },
    });

    const authors = await this.prisma.person.findMany({
      select: { slug: true, updatedAt: true },
    });

    const baseUrl = siteUrl.replace(/\/+$/, '');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Articles URLs (Multilingual entries with alternates)
    for (const post of posts) {
      const idSlug = post.slugId || post.slug;
      const enSlug = post.slugEn || post.slug;
      const idLoc = `${baseUrl}/blog/${idSlug}`;
      const enLoc = `${baseUrl}/en/blog/${enSlug}`;
      const lastmod = (post.contentUpdatedAt || post.publishedAt || new Date()).toISOString();

      const imageXml = post.coverImageUrl
        ? `    <image:image>\n      <image:loc>${post.coverImageUrl}</image:loc>\n` +
          (post.coverImageAlt || post.title
            ? `      <image:title>${(post.coverImageAlt || post.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>\n`
            : '') +
          `    </image:image>\n`
        : '';

      // Indonesian entry
      xml += `  <url>\n`;
      xml += `    <loc>${idLoc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${idLoc}"/>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += imageXml;
      xml += `  </url>\n`;

      // English entry
      xml += `  <url>\n`;
      xml += `    <loc>${enLoc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${idLoc}"/>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += imageXml;
      xml += `  </url>\n`;
    }

    // Category URLs (Multilingual entries with alternates)
    for (const cat of categories) {
      const idSlug = cat.slugId || cat.slug;
      const enSlug = cat.slugEn || cat.slug;
      const idLoc = `${baseUrl}/blog/kategori/${idSlug}`;
      const enLoc = `${baseUrl}/en/blog/kategori/${enSlug}`;
      const lastmod = cat.updatedAt.toISOString();

      // Indonesian category
      xml += `  <url>\n`;
      xml += `    <loc>${idLoc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${idLoc}"/>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;

      // English category
      xml += `  <url>\n`;
      xml += `    <loc>${enLoc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${idLoc}"/>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    // Author URLs
    for (const author of authors) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/author/${author.slug}</loc>\n`;
      xml += `    <lastmod>${author.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.5</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return xml;
  }
}
