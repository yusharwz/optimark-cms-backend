import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMediaParams {
  url: string;
  key: string;
  filename: string;
  altText?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaParams) {
    return this.prisma.media.create({
      data,
    });
  }

  async findAll(limit = 50, offset = 0) {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findById(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  async updateAltText(id: string, altText: string) {
    return this.prisma.media.update({
      where: { id },
      data: { altText },
    });
  }

  async delete(id: string) {
    return this.prisma.media.delete({
      where: { id },
    });
  }
}
