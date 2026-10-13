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

async function main() {
  console.log('🌱 [Manual Seed] Starting production seed from https://optimark.ai/blog...');

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
  }
  console.log(`✅ People (E-E-A-T) seeded: ${personMap.size} profiles`);

  // 3. Articles
  let createdCount = 0;
  for (const art of articles) {
    const categoryId = categoryMap.get(art.categorySlug);
    const authorId = personMap.get(art.authorSlug);
    const reviewerId = personMap.get(art.reviewerSlug);
    const toc = extractTOC(art.content);

    await prisma.article.upsert({
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
        contentUpdatedAt: art.contentUpdatedAt ? new Date(art.contentUpdatedAt) : null,
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
        contentUpdatedAt: art.contentUpdatedAt ? new Date(art.contentUpdatedAt) : null,
        categoryId,
        authorId,
        reviewerId,
      },
    });
    createdCount++;
  }
  console.log(`✅ Articles seeded: ${createdCount} published articles`);
  console.log('🎉 Production articles seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
