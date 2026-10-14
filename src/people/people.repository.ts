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
        roleId: data.roleId || data.role,
        roleEn: data.roleEn || data.role,
        positionId: data.positionId,
        positionEn: data.positionEn,
        bio: data.bio,
        bioId: data.bioId || data.bio,
        bioEn: data.bioEn || data.bio,
        expertiseId: data.expertiseId || [],
        expertiseEn: data.expertiseEn || [],
        experienceId: data.experienceId,
        experienceEn: data.experienceEn,
        educationId: data.educationId,
        educationEn: data.educationEn,
        avatarUrl: data.avatarUrl,
        linkedinUrl: data.linkedinUrl,
        type: data.type ?? PersonType.BOTH,
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async findAll(type?: PersonType) {
    return this.prisma.person.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: 'asc' },
      include: {
        user: { select: { id: true, email: true, role: true } },
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
        user: { select: { id: true, email: true, role: true } },
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
        user: { select: { id: true, email: true, role: true } },
        authoredArticles: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            coverImageUrl: true,
            readMinutes: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        reviewedArticles: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            coverImageUrl: true,
            readMinutes: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdatePersonDto) {
    const { email, password, userRole, ...personData } = data;
    return this.prisma.person.update({
      where: { id },
      data: personData,
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.person.delete({
      where: { id },
    });
  }
}
