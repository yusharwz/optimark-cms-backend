import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env');
}

const schema = new URL(connectionString).searchParams.get('schema') || 'optimark_cms';
const adapter = new PrismaPg({ connectionString }, { schema });
const prisma = new PrismaClient({ adapter });

function extractTOC(content) {
  if (!content) return [];
  const items = [];
  const lines = content.split('\n');
  const seenIds = new Set();

  for (const line of lines) {
    const match = line.trim().match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, '').trim();
      let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'heading';
      let count = 1;
      let uniqueId = id;
      while (seenIds.has(uniqueId)) {
        uniqueId = `${id}-${count++}`;
      }
      seenIds.add(uniqueId);
      items.push({ id: uniqueId, level, text });
    }
  }
  return items;
}

function markdownToBlocks(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const blocks = [];
  let currentParagraph = [];
  let currentUl = [];
  let currentOl = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) blocks.push({ type: 'p', text });
      currentParagraph = [];
    }
  };
  const flushUl = () => {
    if (currentUl.length > 0) {
      blocks.push({ type: 'ul', items: [...currentUl] });
      currentUl = [];
    }
  };
  const flushOl = () => {
    if (currentOl.length > 0) {
      blocks.push({ type: 'ol', items: [...currentOl] });
      currentOl = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushUl();
    flushOl();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushAll();
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushAll();
      blocks.push({ type: 'h2', text: trimmed.replace(/^#{1,2}\s+/, '') });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      flushOl();
      currentUl.push(trimmed.replace(/^[-*]\s+/, ''));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushUl();
      currentOl.push(trimmed.replace(/^\d+\.\s+/, ''));
    } else if (trimmed.startsWith('> ')) {
      flushAll();
      const quoteText = trimmed.replace(/^>\s+/, '');
      if (quoteText.startsWith('**') && quoteText.includes(':**')) {
        const titleMatch = quoteText.match(/^\*\*(.*?):\*\*\s*(.*)$/);
        if (titleMatch) {
          blocks.push({
            type: 'callout',
            title: titleMatch[1].trim(),
            text: titleMatch[2].trim(),
          });
          continue;
        }
      }
      blocks.push({ type: 'quote', text: quoteText });
    } else if (trimmed.startsWith('![')) {
      flushAll();
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        blocks.push({
          type: 'figure',
          image: imgMatch[2].trim(),
          caption: imgMatch[1].trim() || undefined,
        });
      }
    } else {
      flushUl();
      flushOl();
      currentParagraph.push(trimmed);
    }
  }
  flushAll();
  return blocks;
}

async function main() {
  console.log('🌱 [Manual Seed] Starting production seed with bilingual ID & EN articles...');

  const raw = fs.readFileSync(path.join(__dirname, 'production-seed.json'), 'utf-8');
  const { categories, people, articles } = JSON.parse(raw);

  // 1. Categories
  const categoryMap = new Map();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);

    // Ensure category exists in optimark_landing
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_categories (id, slug, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, updated_at = NOW()`,
        cat.slug,
        cat.slug,
        cat.sortOrder || 0
      );
      for (const locale of ['id', 'en']) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO optimark_landing.blog_category_translations (id, category_id, locale, name)
           VALUES ($1, $2, $3::"Locale", $4)
           ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name`,
          `trans_${cat.slug}_${locale}`,
          cat.slug,
          locale,
          cat.name
        );
      }
    } catch (e) {
      console.warn(`[CategorySyncWarning] optimark_landing category note for ${cat.slug}:`, e.message);
    }
  }
  console.log(`✅ Categories seeded: ${categoryMap.size} categories`);

  // 2. People
  const personMap = new Map();
  for (const p of people) {
    const record = await prisma.person.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        role: p.role,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        linkedinUrl: p.linkedinUrl,
        type: p.type,
      },
      create: {
        name: p.name,
        slug: p.slug,
        role: p.role,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        linkedinUrl: p.linkedinUrl,
        type: p.type,
      },
    });
    personMap.set(p.slug, record.id);

    // Ensure person exists in optimark_landing
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_people (id, slug, name, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()`,
        p.slug,
        p.slug,
        p.name,
        p.avatarUrl
      );
      for (const locale of ['id', 'en']) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO optimark_landing.blog_person_translations (id, person_id, locale, role, bio)
           VALUES ($1, $2, $3::"Locale", $4, $5)
           ON CONFLICT (person_id, locale) DO UPDATE SET role = EXCLUDED.role`,
          `trans_${p.slug}_${locale}`,
          p.slug,
          locale,
          p.role,
          p.bio || `${p.name} adalah kontributor konten Optimark.`
        );
      }
    } catch (e) {
      console.warn(`[PersonSyncWarning] optimark_landing person note for ${p.slug}:`, e.message);
    }
  }
  console.log(`✅ People (E-E-A-T) seeded: ${personMap.size} profiles`);

  // 3. Articles + Translations (optimark_cms)
  let createdCount = 0;
  for (const art of articles) {
    const categoryId = categoryMap.get(art.categorySlug);
    const authorId = personMap.get(art.authorSlug);
    const reviewerId = personMap.get(art.reviewerSlug);
    const toc = extractTOC(art.content);

    const article = await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: art.content,
        metaTitle: art.metaTitle,
        metaDescription: art.metaDescription,
        coverImageUrl: art.coverImageUrl,
        coverImageAlt: art.coverImageAlt,
        canonicalUrl: art.canonicalUrl,
        tags: art.tags,
        readMinutes: art.readMinutes,
        status: 'PUBLISHED',
        featured: art.featured,
        tableOfContents: toc,
        publishedAt: new Date(art.publishedAt),
        contentUpdatedAt: art.contentUpdatedAt ? new Date(art.contentUpdatedAt) : new Date(),
        categoryId,
        authorId,
        reviewerId,
      },
      create: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        metaTitle: art.metaTitle,
        metaDescription: art.metaDescription,
        coverImageUrl: art.coverImageUrl,
        coverImageAlt: art.coverImageAlt,
        canonicalUrl: art.canonicalUrl,
        tags: art.tags,
        readMinutes: art.readMinutes,
        status: 'PUBLISHED',
        featured: art.featured,
        tableOfContents: toc,
        publishedAt: new Date(art.publishedAt),
        contentUpdatedAt: art.contentUpdatedAt ? new Date(art.contentUpdatedAt) : new Date(),
        categoryId,
        authorId,
        reviewerId,
      },
    });

    // Seed Translations for optimark_cms (ID and EN)
    if (art.translations) {
      for (const locale of ['id', 'en']) {
        const tr = art.translations[locale];
        if (tr) {
          await prisma.articleTranslation.upsert({
            where: {
              articleId_locale: {
                articleId: article.id,
                locale,
              },
            },
            update: {
              title: tr.title,
              excerpt: tr.excerpt,
              content: tr.content,
              metaTitle: tr.metaTitle,
              metaDescription: tr.metaDescription,
            },
            create: {
              articleId: article.id,
              locale,
              title: tr.title,
              excerpt: tr.excerpt,
              content: tr.content,
              metaTitle: tr.metaTitle,
              metaDescription: tr.metaDescription,
            },
          });
        }
      }
    }

    // Also sync to optimark_landing.blog_posts & translations
    try {
      const postId = `post_${art.slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      const now = new Date();

      await prisma.$executeRawUnsafe(
        `INSERT INTO optimark_landing.blog_posts (
          id, external_id, slug, status, category_id, author_id, reviewer_id,
          cover_image_url, cover_image_alt, read_minutes, featured,
          published_at, content_updated_at, created_at, updated_at,
          canonical_url, tags
        ) VALUES (
          $1, $2, $3, 'PUBLISHED'::"BlogPostStatus", $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16
        )
        ON CONFLICT (slug) DO UPDATE SET
          external_id = EXCLUDED.external_id,
          status = 'PUBLISHED'::"BlogPostStatus",
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
        article.id,
        art.slug,
        art.categorySlug,
        art.authorSlug,
        art.reviewerSlug || null,
        art.coverImageUrl,
        art.coverImageAlt,
        art.readMinutes,
        art.featured,
        new Date(art.publishedAt),
        art.contentUpdatedAt ? new Date(art.contentUpdatedAt) : now,
        new Date(art.publishedAt),
        now,
        art.canonicalUrl,
        art.tags,
      );

      // Translations in optimark_landing
      for (const locale of ['id', 'en']) {
        const tr = art.translations?.[locale] || {
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          metaTitle: art.metaTitle,
          metaDescription: art.metaDescription,
        };
        const blocks = markdownToBlocks(tr.content);
        const bodyJson = JSON.stringify(blocks);

        await prisma.$executeRawUnsafe(
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
          tr.title,
          tr.excerpt || '',
          tr.metaTitle || tr.title,
          tr.metaDescription || tr.excerpt || '',
          bodyJson,
        );
      }
    } catch (landingErr) {
      console.warn(`[SyncWarning] optimark_landing sync note for '${art.slug}':`, landingErr.message);
    }

    createdCount++;
  }

  console.log(`✅ Articles seeded: ${createdCount} published articles with complete ID & EN versions!`);
  console.log('🎉 Production articles bilingual seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
