import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';

@Injectable()
export class RedirectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRedirectDto) {
    return this.prisma.redirect.create({
      data: {
        sourcePath: data.sourcePath,
        targetPath: data.targetPath,
        statusCode: data.statusCode ?? 301,
        active: data.active ?? true,
        description: data.description,
      },
    });
  }

  async findAll() {
    return this.prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.redirect.findMany({
      where: { active: true },
    });
  }

  async findById(id: string) {
    return this.prisma.redirect.findUnique({
      where: { id },
    });
  }

  async findBySourcePath(sourcePath: string) {
    return this.prisma.redirect.findUnique({
      where: { sourcePath },
    });
  }

  async update(id: string, data: UpdateRedirectDto) {
    return this.prisma.redirect.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.redirect.delete({
      where: { id },
    });
  }
}
