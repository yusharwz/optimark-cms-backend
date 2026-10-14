import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEED_CATEGORIES, SEED_PEOPLE } from '../seed/seed-data';
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
  }) {
    const { categorySlug, tag, search, page = 1, limit = 12 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
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
          excerpt: true,
          coverImageUrl: true,
          coverImageAlt: true,
          readMinutes: true,
          featured: true,
          tags: true,
          publishedAt: true,
          contentUpdatedAt: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true, slug: true, role: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.article.count({ where }),
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

  async getPostBySlug(slug: string) {
    const post = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        reviewer: true,
      },
    });

    if (!post || post.status !== ArticleStatus.PUBLISHED) {
      // Check if there is a 301 redirect for this slug
      const redirect = await this.prisma.redirect.findUnique({
        where: { sourcePath: `/blog/${slug}` },
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
        excerpt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        publishedAt: true,
        readMinutes: true,
      },
    });

    return { post, relatedPosts };
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
    const category = await this.prisma.category.findUnique({
      where: { slug },
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

    return { success: true, message: 'Taxonomy and People synchronized with seed data' };
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
        publishedAt: true,
        contentUpdatedAt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        title: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const authors = await this.prisma.person.findMany({
      select: { slug: true, updatedAt: true },
    });

    const baseUrl = siteUrl.replace(/\/+$/, '');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Articles URLs
    for (const post of posts) {
      const loc = `${baseUrl}/blog/${post.slug}`;
      const lastmod = (post.contentUpdatedAt || post.publishedAt || new Date()).toISOString();

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      if (post.coverImageUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${post.coverImageUrl}</image:loc>\n`;
        if (post.coverImageAlt || post.title) {
          const titleSafe = (post.coverImageAlt || post.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `      <image:title>${titleSafe}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    // Category URLs
    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/kategori/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${cat.updatedAt.toISOString()}</lastmod>\n`;
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
