import 'dotenv/config';
import { PrismaClient, PersonType, ArticleStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const schema = new URL(connectionString).searchParams.get('schema') || 'optimark_cms';
const adapter = new PrismaPg({ connectionString }, { schema });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Optimark CMS Database...');

  // 1. Categories
  const categories = [
    { name: 'SEO & Search', slug: 'seo-search', description: 'Strategi optimasi mesin pencari dan visibilitas organik', sortOrder: 1 },
    { name: 'AI & Automasi', slug: 'ai-automasi', description: 'Pemanfaatan AI untuk pembuatan konten dan efisiensi', sortOrder: 2 },
    { name: 'Strategi Konten', slug: 'strategi-konten', description: 'Panduan copywriting, content planning, dan editorial', sortOrder: 3 },
    { name: 'Bisnis & Pertumbuhan', slug: 'bisnis-pertumbuhan', description: 'Analisis pasar, konversi, dan ROI konten', sortOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // 2. People (E-E-A-T Author & Reviewer)
  const people = [
    {
      name: 'Jonathan Anderson',
      slug: 'jonathan-anderson',
      role: 'Head of Content & SEO Strategy',
      bio: 'Praktisi SEO dengan pengalaman 10+ tahun dalam scaling organic traffic dan arsitektur konten enterprise.',
      avatarUrl: 'https://file.usahakreatif.co.id/optimark/avatars/jonathan-anderson.webp',
      linkedinUrl: 'https://linkedin.com/in/jonathan-anderson-seo',
      type: PersonType.BOTH,
    },
    {
      name: 'Sarah Jenkins',
      slug: 'sarah-jenkins',
      role: 'Senior AI Content Researcher',
      bio: 'Spesialis generative AI workflow dan evaluasi E-E-A-T search engine guidelines.',
      avatarUrl: 'https://file.usahakreatif.co.id/optimark/avatars/sarah-jenkins.webp',
      linkedinUrl: 'https://linkedin.com/in/sarah-jenkins-ai',
      type: PersonType.REVIEWER,
    },
  ];

  for (const person of people) {
    await prisma.person.upsert({
      where: { slug: person.slug },
      update: person,
      create: person,
    });
  }
  console.log('✅ People (Authors & Reviewers) seeded');

  // 3. Sample Published Article
  const author = await prisma.person.findUnique({ where: { slug: 'jonathan-anderson' } });
  const reviewer = await prisma.person.findUnique({ where: { slug: 'sarah-jenkins' } });
  const category = await prisma.category.findUnique({ where: { slug: 'seo-search' } });

  const samplePost = {
    title: 'Panduan Lengkap SEO Berbasis AI untuk Meningkatkan Trafik Organik 2026',
    slug: 'panduan-lengkap-seo-ai-organik-2026',
    excerpt: 'Pelajari bagaimana mengombinasikan kecerdasan buatan dan prinsip E-E-A-T Google untuk mendominasi peringkat mesin pencari di tahun 2026.',
    metaTitle: 'Panduan Lengkap SEO AI 2026 | Optimark',
    metaDescription: 'Strategi praktis riset keyword, konten terstruktur, dan optimasi E-E-A-T menggunakan teknologi AI terbaru.',
    canonicalUrl: 'https://optimark.ai/blog/panduan-lengkap-seo-ai-organik-2026',
    coverImageUrl: 'https://file.usahakreatif.co.id/optimark/blog-covers/seo-ai-guide-cover.webp',
    coverImageAlt: 'Grafik peningkatan trafik organik SEO menggunakan AI',
    tags: ['SEO', 'Artificial Intelligence', 'Organic Traffic', 'Content Strategy'],
    readMinutes: 6,
    status: ArticleStatus.PUBLISHED,
    featured: true,
    publishedAt: new Date(),
    contentUpdatedAt: new Date(),
    categoryId: category?.id,
    authorId: author?.id,
    reviewerId: reviewer?.id,
    content: `# Panduan Lengkap SEO Berbasis AI untuk Meningkatkan Trafik Organik 2026

Perkembangan algoritma pencarian menuntut pendekatan yang lebih terukur dalam memproduksi konten berkualitas tinggi.

## 1. Memahami Algoritma Pencarian Modern
Search engine kini semakin memprioritaskan pemahaman konteks semantik dibandingkan sekadar kepadatan kata kunci.

### Faktor E-E-A-T yang Krusial
Experience, Expertise, Authoritativeness, dan Trustworthiness menjadi pilar utama dalam menentukan kelayakan sebuah artikel untuk tampil di posisi teratas.

## 2. Struktur Konten yang SEO-Friendly
Penggunaan heading H1 hingga H4 yang hierarkis membantu bot mesin pencari dan pembaca memahami alur informasi secara cepat.

### Tabel Konten Otomatis
Daftar isi interaktif meningkatkan retensi pengguna dan menghasilkan sitelinks di SERP Google.

## 3. Kesimpulan & Rekomendasi Praktis
Kombinasi AI dan editorial manusia menghasilkan konten yang tidak hanya cepat dibuat, namun juga berdaya saing tinggi.`,
    tableOfContents: [
      { id: 'panduan-lengkap-seo-berbasis-ai-untuk-meningkatkan-trafik-organik-2026', level: 1, text: 'Panduan Lengkap SEO Berbasis AI untuk Meningkatkan Trafik Organik 2026' },
      { id: '1-memahami-algoritma-pencarian-modern', level: 2, text: '1. Memahami Algoritma Pencarian Modern' },
      { id: 'faktor-e-e-a-t-yang-krusial', level: 3, text: 'Faktor E-E-A-T yang Krusial' },
      { id: '2-struktur-konten-yang-seo-friendly', level: 2, text: '2. Struktur Konten yang SEO-Friendly' },
      { id: 'tabel-konten-otomatis', level: 3, text: 'Tabel Konten Otomatis' },
      { id: '3-kesimpulan-rekomendasi-praktis', level: 2, text: '3. Kesimpulan & Rekomendasi Praktis' },
    ],
  };

  await prisma.article.upsert({
    where: { slug: samplePost.slug },
    update: samplePost,
    create: samplePost,
  });

  console.log('✅ Sample published article seeded');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
