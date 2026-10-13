import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonType } from '@prisma/client';

@Injectable()
export class PeopleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePersonDto & { slug: string }) {
    return this.prisma.person.create({
      data: {
        name: data.name,
        slug: data.slug,
        role: data.role,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        linkedinUrl: data.linkedinUrl,
        type: data.type ?? PersonType.BOTH,
      },
    });
  }

  async findAll(type?: PersonType) {
    return this.prisma.person.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.person.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.person.findUnique({
      where: { slug },
      include: {
        authoredArticles: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, publishedAt: true, coverImageUrl: true },
        },
        reviewedArticles: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, publishedAt: true, coverImageUrl: true },
        },
      },
    });
  }

  async update(id: string, data: UpdatePersonDto) {
    return this.prisma.person.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.person.delete({
      where: { id },
    });
  }
}
