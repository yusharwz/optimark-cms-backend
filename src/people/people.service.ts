import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

@Injectable()
export class PeopleService {
  constructor(
    private readonly repository: PeopleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePersonDto) {
    const slug = dto.slug
      ? slugify(dto.slug, { lower: true, strict: true })
      : slugify(dto.name, { lower: true, strict: true });
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Person with slug '${slug}' already exists.`);
    }

    const person = await this.repository.create({
      ...dto,
      slug,
    });

    // Handle user credential creation if email and password are provided
    if (dto.email && dto.password) {
      const cleanEmail = dto.email.toLowerCase().trim();
      const existingUser = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
      const passwordHash = bcrypt.hashSync(dto.password, 10);
      const role = (dto.userRole as UserRole) || UserRole.AUTHOR;

      if (existingUser) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            personId: person.id,
            passwordHash,
            role,
            name: person.name,
          },
        });
      } else {
        await this.prisma.user.create({
          data: {
            email: cleanEmail,
            passwordHash,
            name: person.name,
            role,
            personId: person.id,
          },
        });
      }
    }

    return this.findById(person.id);
  }

  async findAll(type?: PersonType) {
    return this.repository.findAll(type);
  }

  async findById(id: string) {
    let person: any = await this.repository.findById(id);
    if (!person) {
      person = await this.repository.findBySlug(id);
    }
    if (!person) {
      throw new NotFoundException(`Person with ID or slug '${id}' not found.`);
    }
    return person;
  }

  async findBySlug(slug: string) {
    const person = await this.repository.findBySlug(slug);
    if (!person) {
      throw new NotFoundException(`Person with slug '${slug}' not found.`);
    }
    return person;
  }

  async update(id: string, dto: UpdatePersonDto) {
    const person = await this.findById(id);

    let slug = dto.slug;
    if (slug) {
      slug = slugify(slug, { lower: true, strict: true });
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== person.id) {
        throw new ConflictException(`Person with slug '${slug}' already exists.`);
      }
    }

    await this.repository.update(person.id, {
      ...dto,
      ...(slug ? { slug } : {}),
    });

    // Handle user credential updates
    if (dto.email) {
      const cleanEmail = dto.email.toLowerCase().trim();
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ personId: person.id }, { email: cleanEmail }],
        },
      });

      const role = (dto.userRole as UserRole) || UserRole.AUTHOR;
      const updateData: any = {
        email: cleanEmail,
        name: dto.name || person.name,
        role,
        personId: person.id,
      };

      if (dto.password && dto.password.trim().length > 0) {
        updateData.passwordHash = bcrypt.hashSync(dto.password.trim(), 10);
      }

      if (existingUser) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
      } else if (dto.password && dto.password.trim().length > 0) {
        await this.prisma.user.create({
          data: {
            ...updateData,
            passwordHash: bcrypt.hashSync(dto.password.trim(), 10),
          },
        });
      }
    }

    return this.findById(person.id);
  }

  async remove(id: string) {
    const person = await this.findById(id);
    return this.repository.delete(person.id);
  }
}
