import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { UploadedFileDto } from './media.interface';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePresignedUrlDto, ConfirmMediaUploadDto } from './dto/presigned-url.dto';
import sharp from 'sharp';
import path from 'path';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly repository: MediaRepository) {
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
    return this.repository.findAll(limit, offset);
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
