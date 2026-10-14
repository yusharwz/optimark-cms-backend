import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { UploadedFileDto } from './media.interface';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePresignedUrlDto, ConfirmMediaUploadDto } from './dto/presigned-url.dto';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import path from 'path';

@Injectable()
export class MediaService {
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
          filename = `${path.basename(filename, ext)}.webp`;
        }
      } catch (err) {
        console.warn('Sharp processing failed, uploading original buffer:', err);
      }
    }

    const timestamp = Date.now();
    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const key = `optimark/blog-uploads/${timestamp}-${cleanFilename}`;

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
        key: 'optimark/blog/riset-keyword-bisnis-lokal.jpg',
        filename: 'riset-keyword-bisnis-lokal.jpg',
        altText: 'Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar',
        mimeType: 'image/jpeg',
        size: 124641,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/jadwal-posting-instagram-umkm-kuliner.jpg',
        filename: 'jadwal-posting-instagram-umkm-kuliner.jpg',
        altText: 'Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026',
        mimeType: 'image/jpeg',
        size: 118400,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/foto-produk-ai-smartphone.jpg',
        filename: 'foto-produk-ai-smartphone.jpg',
        altText: 'Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone',
        mimeType: 'image/jpeg',
        size: 132100,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/strategi-content-pillar.jpg',
        filename: 'strategi-content-pillar.jpg',
        altText: 'Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting',
        mimeType: 'image/jpeg',
        size: 121500,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/website-belum-muncul-di-google.jpg',
        filename: 'website-belum-muncul-di-google.jpg',
        altText: 'Kenapa Website Kamu Belum Muncul di Halaman Pertama Google',
        mimeType: 'image/jpeg',
        size: 145200,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/warna-feed-instagram.jpg',
        filename: 'warna-feed-instagram.jpg',
        altText: 'Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand',
        mimeType: 'image/jpeg',
        size: 110400,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/caption-tiktok.jpg',
        filename: 'caption-tiktok.jpg',
        altText: 'Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi',
        mimeType: 'image/jpeg',
        size: 129800,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/artikel-jadi-konten-media-sosial.jpg',
        filename: 'artikel-jadi-konten-media-sosial.jpg',
        altText: 'Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial',
        mimeType: 'image/jpeg',
        size: 135600,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/video-promosi-singkat.jpg',
        filename: 'video-promosi-singkat.jpg',
        altText: 'Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor',
        mimeType: 'image/jpeg',
        size: 141200,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/target-audiens.jpg',
        filename: 'target-audiens.jpg',
        altText: 'Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online',
        mimeType: 'image/jpeg',
        size: 126900,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/insight-instagram.jpg',
        filename: 'insight-instagram.jpg',
        altText: 'Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif',
        mimeType: 'image/jpeg',
        size: 138700,
        width: 1200,
        height: 675,
      },
      {
        key: 'optimark/blog/people/jonathan-anderson.jpg',
        filename: 'jonathan-anderson.jpg',
        altText: 'Jonathan Anderson T. - Reviewer',
        mimeType: 'image/jpeg',
        size: 89400,
        width: 400,
        height: 400,
      },
      {
        key: 'optimark/blog/people/rafi-rizky.jpg',
        filename: 'rafi-rizky.jpg',
        altText: 'Rafi Rizky - Author',
        mimeType: 'image/jpeg',
        size: 84200,
        width: 400,
        height: 400,
      },
      {
        key: 'optimark/blog/people/thia-rahmani.jpg',
        filename: 'thia-rahmani.jpg',
        altText: 'Thia Rahmani - Author',
        mimeType: 'image/jpeg',
        size: 91100,
        width: 400,
        height: 400,
      },
    ];

    for (const item of predefined) {
      const url = `${this.publicUrl}/${item.key}`;
      try {
        await this.prisma.media.upsert({
          where: { key: item.key },
          update: { url, altText: item.altText },
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

  async getPresignedDownloadUrl(key: string, expiresIn = 86400) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async getPresignedUploadUrl(dto: CreatePresignedUrlDto) {
    const timestamp = Date.now();
    const cleanFilename = dto.filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const key = `optimark/blog-uploads/${timestamp}-${cleanFilename}`;

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
      filename: dto.filename,
      mimeType: dto.mimeType,
      altText: dto.altText || path.basename(dto.filename, path.extname(dto.filename)),
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
