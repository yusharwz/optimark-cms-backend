import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { UploadedFileDto } from './media.interface';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePresignedUrlDto, ConfirmMediaUploadDto } from './dto/presigned-url.dto';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import path from 'path';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly repository: MediaRepository,
    private readonly prisma: PrismaService,
  ) {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY;
    const secretAccessKey = process.env.R2_SECRET_KEY;
    this.bucket = process.env.R2_BUCKET || 'cms-staging-dokploy';
    this.publicUrl = (process.env.R2_PUBLIC_URL || 'https://optimark-staging-media.dritech.co.id').replace(/\/+$/, '');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      console.warn('R2 credentials not fully configured in MediaService');
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async onModuleInit() {
    // Run migration asynchronously after database and app initialization
    setTimeout(() => {
      this.migrateExistingMediaToWebp().catch((err) => {
        console.warn('[WebP Migration onModuleInit non-blocking notice]:', err.message);
      });
    }, 2500);
  }

  async uploadFile(file: UploadedFileDto, altText?: string, convertToWebp = true) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file buffer provided.');
    }

    let buffer = file.buffer;
    let mimeType = file.mimetype;
    let filename = file.originalname;
    let width: number | undefined;
    let height: number | undefined;

    // Process image with sharp if it's an image
    if (file.mimetype.startsWith('image/')) {
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        width = metadata.width;
        height = metadata.height;

        if (convertToWebp && file.mimetype !== 'image/svg+xml') {
          buffer = await image.webp({ quality: 85 }).toBuffer();
          mimeType = 'image/webp';
          const ext = path.extname(filename);
          const base = path.basename(filename, ext);
          const cleanBase = base
            .toLowerCase()
            .trim()
            .replace(/specialist/g, 'spesialist')
            .replace(/[^\w\s-()]/g, '')
            .replace(/\s+/g, '-')
            .replace(/\(-+/g, '(')
            .replace(/-+\)/g, ')')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
          filename = `${cleanBase}.webp`;
        }
      } catch (err) {
        console.warn('Sharp processing failed, uploading original buffer:', err);
      }
    }

    const timestamp = Date.now();
    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9.()_-]/g, '-');
    const key = `optimark/blog-uploads/${cleanFilename.startsWith('table-') ? `${timestamp}-${cleanFilename}` : cleanFilename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const url = `${this.publicUrl}/${key}`;

    return this.repository.create({
      url,
      key,
      filename,
      altText: altText || path.basename(filename, path.extname(filename)),
      mimeType,
      size: buffer.length,
      width,
      height,
    });
  }

  async findAll(limit = 50, offset = 0) {
    const count = await this.prisma.media.count();
    if (count < 10) {
      await this.syncPredefinedMedia();
    }
    return this.repository.findAll(limit, offset);
  }

  async deleteMedia(id: string) {
    const media = await this.repository.findById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID '${id}' not found.`);
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: media.key,
        }),
      );
    } catch (s3Err: any) {
      console.warn(`[Delete Media] S3 deletion error for ${media.key}:`, s3Err.message);
    }

    await this.repository.delete(id);
    return { success: true, id, key: media.key };
  }

  async syncPredefinedMedia() {
    try {
      await this.prisma.$executeRawUnsafe(`
        DELETE FROM cms_media WHERE filename = 'staging-test-banner.png' OR key LIKE '%staging-test-banner%';
      `);
    } catch {}

    const predefined = [
      {
        key: 'optimark/blog/riset-keyword-bisnis-lokal.webp',
        filename: 'riset-keyword-bisnis-lokal.webp',
        altText: 'Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar',
        mimeType: 'image/webp',
        size: 78500,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/jadwal-posting-instagram-umkm-kuliner.webp',
        filename: 'jadwal-posting-instagram-umkm-kuliner.webp',
        altText: 'Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026',
        mimeType: 'image/webp',
        size: 74200,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/foto-produk-ai-smartphone.webp',
        filename: 'foto-produk-ai-smartphone.webp',
        altText: 'Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone',
        mimeType: 'image/webp',
        size: 81200,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/strategi-content-pillar.webp',
        filename: 'strategi-content-pillar.webp',
        altText: 'Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting',
        mimeType: 'image/webp',
        size: 76800,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/website-belum-muncul-di-google.webp',
        filename: 'website-belum-muncul-di-google.webp',
        altText: 'Kenapa Website Kamu Belum Muncul di Halaman Pertama Google',
        mimeType: 'image/webp',
        size: 69400,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/warna-feed-instagram.webp',
        filename: 'warna-feed-instagram.webp',
        altText: 'Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand',
        mimeType: 'image/webp',
        size: 72100,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/caption-tiktok.webp',
        filename: 'caption-tiktok.webp',
        altText: 'Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi',
        mimeType: 'image/webp',
        size: 75400,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/artikel-jadi-konten-media-sosial.webp',
        filename: 'artikel-jadi-konten-media-sosial.webp',
        altText: 'Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial',
        mimeType: 'image/webp',
        size: 83200,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/video-promosi-singkat.webp',
        filename: 'video-promosi-singkat.webp',
        altText: 'Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor',
        mimeType: 'image/webp',
        size: 88400,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/target-audiens.webp',
        filename: 'target-audiens.webp',
        altText: 'Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online',
        mimeType: 'image/webp',
        size: 71300,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/insight-instagram.webp',
        filename: 'insight-instagram.webp',
        altText: 'Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif',
        mimeType: 'image/webp',
        size: 86500,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/people/jonathan-anderson.webp',
        filename: 'jonathan-anderson.webp',
        altText: 'Jonathan Anderson T. - Reviewer',
        mimeType: 'image/webp',
        size: 21400,
        width: 400,
        height: 400,
      },
      {
        key: 'optimark/blog/people/rafi-rizky.webp',
        filename: 'rafi-rizky.webp',
        altText: 'Rafi Rizky - Author',
        mimeType: 'image/webp',
        size: 19800,
        width: 400,
        height: 400,
      },
      {
        key: 'optimark/blog/people/thia-rahmani.webp',
        filename: 'thia-rahmani.webp',
        altText: 'Thia Rahmani - Author',
        mimeType: 'image/webp',
        size: 18200,
        width: 400,
        height: 400,
      },
      {
        key: 'optimark/blog/people/logos/usaha-kreatif.webp',
        filename: 'usaha-kreatif.webp',
        altText: 'PT Usaha Kreatif Indonesia Logo',
        mimeType: 'image/webp',
        size: 2200,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/sribu.webp',
        filename: 'sribu.webp',
        altText: 'PT Sribu Digital Kreatif Logo',
        mimeType: 'image/webp',
        size: 2400,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/mnc-media.webp',
        filename: 'mnc-media.webp',
        altText: 'MNC Group Logo',
        mimeType: 'image/webp',
        size: 2600,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/cj-pro.webp',
        filename: 'cj-pro.webp',
        altText: 'PT Citra Jasa Andalan Logo',
        mimeType: 'image/webp',
        size: 2300,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/sanata-dharma.webp',
        filename: 'sanata-dharma.webp',
        altText: 'Sanata Dharma University Logo',
        mimeType: 'image/webp',
        size: 3100,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/purwadhika.webp',
        filename: 'purwadhika.webp',
        altText: 'Purwadhika Digital Technology School Logo',
        mimeType: 'image/webp',
        size: 2900,
        width: 120,
        height: 120,
      },
      {
        key: 'optimark/blog/people/logos/digital-marketing-(seo-spesialist).webp',
        filename: 'digital-marketing-(seo-spesialist).webp',
        altText: 'Digital Marketing (SEO Specialist) Logo',
        mimeType: 'image/webp',
        size: 3384,
        width: 120,
        height: 120,
      },
    ];

    for (const item of predefined) {
      const url = `${this.publicUrl}/${item.key}`;
      try {
        await this.prisma.media.upsert({
          where: { key: item.key },
          update: { url, altText: item.altText, mimeType: 'image/webp', filename: item.filename },
          create: {
            ...item,
            url,
          },
        });
      } catch (err: any) {
        console.warn('Media upsert note:', err.message);
      }
    }
  }

  async migrateExistingMediaToWebp() {
    console.log('[WebP Migration] Starting existing media conversion to WebP...');
    const results = {
      converted: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // 1. Articles - Fix coverImageUrl to point to .webp
    try {
      const articles = await this.prisma.article.findMany({
        select: { id: true, slug: true, coverImageUrl: true },
      });

      for (const article of articles) {
        if (!article.coverImageUrl) continue;
        if (article.coverImageUrl.endsWith('.webp')) {
          results.skipped++;
          continue;
        }

        try {
          const webpKey = `optimark/blog/${article.slug}.webp`;
          const candidateUrl = `${this.publicUrl}/${webpKey}`;

          // If current cover is non-webp (e.g. .jpg), map directly to R2 .webp
          await this.prisma.article.update({
            where: { id: article.id },
            data: { coverImageUrl: candidateUrl },
          });

          await this.prisma.media.upsert({
            where: { key: webpKey },
            create: {
              url: candidateUrl,
              key: webpKey,
              filename: `${article.slug}.webp`,
              mimeType: 'image/webp',
              size: 80000,
              altText: article.slug,
            },
            update: {
              url: candidateUrl,
              mimeType: 'image/webp',
            },
          });

          results.converted++;
          console.log(`[WebP Migration] Linked article ${article.slug} cover to ${candidateUrl}`);
        } catch (err: any) {
          console.error(`[WebP Migration] Error converting article ${article.slug}:`, err.message);
          results.errors.push(`Article ${article.slug}: ${err.message}`);
        }
      }
    } catch (dbErr: any) {
      console.warn('[WebP Migration] Articles scan note:', dbErr.message);
    }

    // 2. People (Avatars & Experience/Education Logos)
    try {
      const people = await this.prisma.person.findMany();

      for (const person of people) {
        let updated = false;
        let newAvatarUrl = person.avatarUrl;

        if (person.avatarUrl && !person.avatarUrl.endsWith('.webp')) {
          const webpKey = `optimark/blog/people/${person.slug}.webp`;
          const candidateAvatarUrl = `${this.publicUrl}/${webpKey}`;
          newAvatarUrl = candidateAvatarUrl;
          updated = true;

          await this.prisma.media.upsert({
            where: { key: webpKey },
            create: {
              url: candidateAvatarUrl,
              key: webpKey,
              filename: `${person.slug}.webp`,
              mimeType: 'image/webp',
              size: 25000,
              altText: person.name,
            },
            update: {
              url: candidateAvatarUrl,
              mimeType: 'image/webp',
            },
          });
          results.converted++;
        }

        const convertLogosInArray = async (items: any[]) => {
          if (!Array.isArray(items)) return items;
          let arrayModified = false;
          const newItems = [];
          for (const item of items) {
            if (!item.logo) {
              newItems.push(item);
              continue;
            }

            const rawTarget = item.title || item.org || item.degree || 'logo';
            const baseName = rawTarget
              .toLowerCase()
              .trim()
              .replace(/specialist/g, 'spesialist')
              .replace(/[^\w\s-()]/g, '')
              .replace(/\s+/g, '-')
              .replace(/\(-+/g, '(')
              .replace(/-+\)/g, ')')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');

            const webpKey = `optimark/blog/people/logos/${baseName}.webp`;
            const expectedLogoUrl = `${this.publicUrl}/${webpKey}`;

            if (item.logo === expectedLogoUrl) {
              newItems.push(item);
              continue;
            }

            newItems.push({ ...item, logo: expectedLogoUrl });
            arrayModified = true;
          }
          return arrayModified ? newItems : items;
        };

        const newExpId = await convertLogosInArray(person.experienceId as any[]);
        const newExpEn = await convertLogosInArray(person.experienceEn as any[]);
        const newEduId = await convertLogosInArray(person.educationId as any[]);
        const newEduEn = await convertLogosInArray(person.educationEn as any[]);

        if (
          updated ||
          newExpId !== person.experienceId ||
          newExpEn !== person.experienceEn ||
          newEduId !== person.educationId ||
          newEduEn !== person.educationEn
        ) {
          await this.prisma.person.update({
            where: { id: person.id },
            data: {
              avatarUrl: newAvatarUrl,
              experienceId: newExpId,
              experienceEn: newExpEn,
              educationId: newEduId,
              educationEn: newEduEn,
            },
          });
          console.log(`[WebP Migration] Updated person ${person.slug} profile logos & avatar`);
        }
      }
    } catch (dbErr: any) {
      console.warn('[WebP Migration] People scan note:', dbErr.message);
    }

    // 3. Normalize inline images inside Articles & Translations
    try {
      const allArticles = await this.prisma.article.findMany({
        include: { translations: true },
      });

      const normalizeContent = (text: string) => {
        return text
          .replace(/\/images\/blog\/([a-zA-Z0-9_-]+)\.(?:jpg|jpeg|png)/g, `${this.publicUrl}/optimark/blog/$1.webp`)
          .replace(new RegExp(`${this.publicUrl}/optimark/blog/([a-zA-Z0-9_-]+)\\.(?:jpg|jpeg|png)`, 'g'), `${this.publicUrl}/optimark/blog/$1.webp`);
      };

      for (const a of allArticles) {
        if (a.content) {
          const newContent = normalizeContent(a.content);
          if (newContent !== a.content) {
            await this.prisma.article.update({
              where: { id: a.id },
              data: { content: newContent },
            });
            console.log(`[WebP Migration] Normalized inline content images for article ${a.slug}`);
          }
        }

        for (const t of a.translations) {
          if (t.content) {
            const newTrContent = normalizeContent(t.content);
            if (newTrContent !== t.content) {
              await this.prisma.articleTranslation.update({
                where: { id: t.id },
                data: { content: newTrContent },
              });
              console.log(`[WebP Migration] Normalized translation ${t.locale} content for article ${a.slug}`);
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[WebP Migration] Content scan note:', err.message);
    }

    // 4. Purge redundant/deleted keys from Media table
    const redundantKeys = [
      'optimark/blog-uploads/1792001069373-screenshot-from-2026-10-15-00-30-37.webp',
      'optimark/blog-uploads/digital-marketing-(seo-specialist).webp',
      'optimark/blog-uploads/jo.webp',
      'optimark/blog-uploads/perbedaan-rejection-candle-dan-pin-bar.webp',
      'optimark/blog-uploads/video-promosi-singkat.webp',
      'optimark/blog-uploads/warna-feed-instagram.webp',
      'optimark/blog/people/logos/digital-marketing-(seo-specialist).webp',
      'optimark/blog/people/logos/mnc-group.webp',
      'optimark/blog/people/logos/optimark.webp',
      'optimark/blog/people/logos/pt-citra-jasa-andalan.webp',
      'optimark/blog/people/logos/pt-sribu-digital-kreatif.webp',
      'optimark/blog/people/logos/pt-usaha-kreatif-indonesia.webp',
      'optimark/blog/people/logos/purwadhika-digital-technology-school.webp',
      'optimark/blog/people/logos/sanata-dharma-university.webp',
    ];

    try {
      await this.prisma.media.deleteMany({
        where: {
          key: { in: redundantKeys },
        },
      });
      console.log(`[WebP Migration] Cleaned up redundant records from cms_media table`);
    } catch (cleanErr: any) {
      console.warn('[WebP Migration] Media purge note:', cleanErr.message);
    }

    // 5. Also run syncPredefinedMedia to ensure all base assets exist in DB as WebP
    await this.syncPredefinedMedia();

    console.log('[WebP Migration] Finished with:', results);
    return results;
  }

  async getPresignedDownloadUrl(key: string, expiresIn = 86400) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async getPresignedUploadUrl(dto: CreatePresignedUrlDto) {
    const timestamp = Date.now();
    const ext = path.extname(dto.filename) || '.webp';
    const base = path.basename(dto.filename, ext);
    const cleanBase = base
      .toLowerCase()
      .trim()
      .replace(/specialist/g, 'spesialist')
      .replace(/[^\w\s-()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\(-+/g, '(')
      .replace(/-+\)/g, ')')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanFilename = `${cleanBase}.webp`;

    // Retain timestamp prefix only for generic words, otherwise use pure clean slug
    const isGeneric = ['image', 'cover', 'avatar', 'upload', 'file', 'photo'].includes(cleanBase);
    const key = isGeneric
      ? `optimark/blog-uploads/${timestamp}-${cleanFilename}`
      : `optimark/blog-uploads/${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const fileUrl = `${this.publicUrl}/${key}`;

    return {
      uploadUrl,
      fileUrl,
      key,
      filename: cleanFilename,
      mimeType: dto.mimeType,
      altText: dto.altText || cleanBase,
    };
  }

  async confirmUpload(dto: ConfirmMediaUploadDto) {
    return this.repository.create({
      url: dto.url,
      key: dto.key,
      filename: dto.filename,
      altText: dto.altText || path.basename(dto.filename, path.extname(dto.filename)),
      mimeType: dto.mimeType,
      size: dto.size || 0,
      width: dto.width,
      height: dto.height,
    });
  }

  async updateAltText(id: string, altText: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Media with ID '${id}' not found.`);
    }
    return this.repository.updateAltText(id, altText);
  }
}
