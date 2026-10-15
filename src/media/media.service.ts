import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { UploadedFileDto } from './media.interface';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
            .replace(/[^\w\s-()]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
          filename = `${cleanBase}.webp`;
        }
      } catch (err) {
        console.warn('Sharp processing failed, uploading original buffer:', err);
      }
    }

    const timestamp = Date.now();
    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
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

    // 1. Articles
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
          const res = await fetch(article.coverImageUrl);
          if (!res.ok) {
            console.warn(`[WebP Migration] Failed to fetch cover for ${article.slug}: ${res.statusText}`);
            continue;
          }
          const arrayBuf = await res.arrayBuffer();
          const inputBuf = Buffer.from(arrayBuf);
          const webpBuf = await sharp(inputBuf).webp({ quality: 85 }).toBuffer();
          const webpKey = `optimark/blog/${article.slug}.webp`;

          await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: webpKey,
              Body: webpBuf,
              ContentType: 'image/webp',
            }),
          );

          const newUrl = `${this.publicUrl}/${webpKey}`;

          await this.prisma.article.update({
            where: { id: article.id },
            data: { coverImageUrl: newUrl },
          });

          await this.prisma.media.upsert({
            where: { key: webpKey },
            create: {
              url: newUrl,
              key: webpKey,
              filename: `${article.slug}.webp`,
              mimeType: 'image/webp',
              size: webpBuf.length,
              altText: article.slug,
            },
            update: {
              url: newUrl,
              size: webpBuf.length,
              mimeType: 'image/webp',
            },
          });

          results.converted++;
          console.log(`[WebP Migration] Converted article ${article.slug} to ${newUrl}`);
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
          try {
            const res = await fetch(person.avatarUrl);
            if (res.ok) {
              const arrayBuf = await res.arrayBuffer();
              const inputBuf = Buffer.from(arrayBuf);
              const webpBuf = await sharp(inputBuf).webp({ quality: 85 }).toBuffer();
              const webpKey = `optimark/blog/people/${person.slug}.webp`;

              await this.s3.send(
                new PutObjectCommand({
                  Bucket: this.bucket,
                  Key: webpKey,
                  Body: webpBuf,
                  ContentType: 'image/webp',
                }),
              );

              newAvatarUrl = `${this.publicUrl}/${webpKey}`;
              updated = true;

              await this.prisma.media.upsert({
                where: { key: webpKey },
                create: {
                  url: newAvatarUrl,
                  key: webpKey,
                  filename: `${person.slug}.webp`,
                  mimeType: 'image/webp',
                  size: webpBuf.length,
                  altText: person.name,
                },
                update: {
                  url: newAvatarUrl,
                  size: webpBuf.length,
                  mimeType: 'image/webp',
                },
              });
              results.converted++;
            }
          } catch (err: any) {
            results.errors.push(`Person avatar ${person.slug}: ${err.message}`);
          }
        }

        const convertLogosInArray = async (items: any[]) => {
          if (!Array.isArray(items)) return items;
          let arrayModified = false;
          const newItems = [];
          for (const item of items) {
            if (item && item.logo && typeof item.logo === 'string' && !item.logo.endsWith('.webp')) {
              try {
                const res = await fetch(item.logo);
                if (res.ok) {
                  const arrayBuf = await res.arrayBuffer();
                  const inputBuf = Buffer.from(arrayBuf);
                  const webpBuf = await sharp(inputBuf).webp({ quality: 85 }).toBuffer();

                  const baseName = (item.org || item.title || item.degree || 'logo')
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-()]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                  const webpKey = `optimark/blog/people/logos/${baseName}.webp`;

                  await this.s3.send(
                    new PutObjectCommand({
                      Bucket: this.bucket,
                      Key: webpKey,
                      Body: webpBuf,
                      ContentType: 'image/webp',
                    }),
                  );

                  const newLogoUrl = `${this.publicUrl}/${webpKey}`;
                  newItems.push({ ...item, logo: newLogoUrl });
                  arrayModified = true;

                  await this.prisma.media.upsert({
                    where: { key: webpKey },
                    create: {
                      url: newLogoUrl,
                      key: webpKey,
                      filename: `${baseName}.webp`,
                      mimeType: 'image/webp',
                      size: webpBuf.length,
                      altText: item.org || item.title || item.degree,
                    },
                    update: {
                      url: newLogoUrl,
                      size: webpBuf.length,
                      mimeType: 'image/webp',
                    },
                  });
                  results.converted++;
                  continue;
                }
              } catch (err: any) {
                results.errors.push(`Logo ${item.logo}: ${err.message}`);
              }
            }
            newItems.push(item);
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

    // 3. Media table cleanup for remaining non-WebP records
    try {
      const nonWebpMedia = await this.prisma.media.findMany({
        where: {
          NOT: { mimeType: 'image/webp' },
        },
      });

      for (const m of nonWebpMedia) {
        if (m.mimeType === 'image/svg+xml') continue;
        try {
          const res = await fetch(m.url);
          if (res.ok) {
            const arrayBuf = await res.arrayBuffer();
            const inputBuf = Buffer.from(arrayBuf);
            const webpBuf = await sharp(inputBuf).webp({ quality: 85 }).toBuffer();

            const ext = path.extname(m.filename);
            const base = path.basename(m.filename, ext);
            const cleanBase = base
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-()]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
            const newFilename = `${cleanBase}.webp`;
            const newKey = m.key.replace(/\.[^/.]+$/, '.webp');

            await this.s3.send(
              new PutObjectCommand({
                Bucket: this.bucket,
                Key: newKey,
                Body: webpBuf,
                ContentType: 'image/webp',
              }),
            );

            const newUrl = `${this.publicUrl}/${newKey}`;

            await this.prisma.media.update({
              where: { id: m.id },
              data: {
                url: newUrl,
                key: newKey,
                filename: newFilename,
                mimeType: 'image/webp',
                size: webpBuf.length,
              },
            });
            results.converted++;
          }
        } catch (err: any) {
          results.errors.push(`Media ${m.key}: ${err.message}`);
        }
      }
    } catch (dbErr: any) {
      console.warn('[WebP Migration] Media scan note:', dbErr.message);
    }

    // Also run syncPredefinedMedia to ensure all 20 base assets exist in DB as WebP
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
      .replace(/[^\w\s-()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
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
