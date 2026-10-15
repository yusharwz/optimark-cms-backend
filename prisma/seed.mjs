import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.join(__dirname, 'production-seed.json');
const raw = fs.readFileSync(seedFilePath, 'utf8');

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
  console.log('🌱 Starting database seeding...');

  // Auto-migrate any legacy optimark.ai URLs to Cloudflare R2 staging
  try {
    const r2Base = 'https://optimark-staging-media.dritech.co.id/optimark/blog/';
    await prisma.$executeRawUnsafe(`
      UPDATE cms_articles SET "cover_image_url" = REPLACE("cover_image_url", 'https://optimark.ai/images/blog/', '${r2Base}') WHERE "cover_image_url" LIKE '%optimark.ai%';
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE cms_people SET "avatar_url" = REPLACE("avatar_url", 'https://optimark.ai/images/blog/', '${r2Base}') WHERE "avatar_url" LIKE '%optimark.ai%';
    `);
    console.log('🖼️ Legacy optimark.ai images migrated to Cloudflare R2 staging.');
  } catch (err) {
    console.warn('Image migration notice:', err.message);
  }

  // 1. Seed or Upsert Categories
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
        type: p.type,
      },
      create: {
        slug: p.slug,
        name: p.name,
        role: p.role,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        type: p.type,
      },
    });
    personMap.set(p.slug, record.id);
  }
  console.log(`✅ People (E-E-A-T) seeded: ${personMap.size} profiles`);

  // 2.5 Seed Initial Users (Admin & Authors)
  const defaultPasswordHash = bcrypt.hashSync('Asdqwe123!', 10);
  const usersToSeed = [
    {
      email: 'admin@optimark.ai',
      name: 'Admin Optimark',
      role: 'ADMIN',
      personId: null,
    },
    {
      email: 'admin@dritech.co.id',
      name: 'Admin Dritech',
      role: 'ADMIN',
      personId: null,
    },
    {
      email: 'rafi@optimark.ai',
      name: 'Rafi Rizky',
      role: 'AUTHOR',
      personId: personMap.get('rafi-rizky') || null,
    },
    {
      email: 'thia@optimark.ai',
      name: 'Thia Rahmani',
      role: 'AUTHOR',
      personId: personMap.get('thia-rahmani') || null,
    },
    {
      email: 'jonathan@optimark.ai',
      name: 'Jonathan Anderson T.',
      role: 'EDITOR',
      personId: personMap.get('jonathan-anderson') || null,
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        personId: u.personId,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        personId: u.personId,
        passwordHash: defaultPasswordHash,
      },
    });
  }
  console.log(`✅ Users seeded: ${usersToSeed.length} accounts configured`);

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
        slugId: art.slugId || art.slug,
        slugEn: art.slugEn,
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
        slugId: art.slugId || art.slug,
        slugEn: art.slugEn,
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
