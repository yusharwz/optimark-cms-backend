import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonType } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class PeopleService {
  constructor(private readonly repository: PeopleRepository) {}

  async create(dto: CreatePersonDto) {
    const slug = dto.slug ? slugify(dto.slug, { lower: true, strict: true }) : slugify(dto.name, { lower: true, strict: true });
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Person with slug '${slug}' already exists.`);
    }

    return this.repository.create({
      ...dto,
      slug,
    });
  }

  async findAll(type?: PersonType) {
    return this.repository.findAll(type);
  }

  async findById(id: string) {
    const person = await this.repository.findById(id);
    if (!person) {
      throw new NotFoundException(`Person with ID '${id}' not found.`);
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
    await this.findById(id);

    let slug = dto.slug;
    if (slug) {
      slug = slugify(slug, { lower: true, strict: true });
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Person with slug '${slug}' already exists.`);
      }
    }

    return this.repository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}
