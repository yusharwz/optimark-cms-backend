import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug, { lower: true, strict: true }) : slugify(dto.name, { lower: true, strict: true });
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Category with slug '${slug}' already exists.`);
    }

    const slugId = dto.slugId ? slugify(dto.slugId, { lower: true, strict: true }) : (dto.nameId ? slugify(dto.nameId, { lower: true, strict: true }) : slug);
    const slugEn = dto.slugEn ? slugify(dto.slugEn, { lower: true, strict: true }) : (dto.nameEn ? slugify(dto.nameEn, { lower: true, strict: true }) : undefined);

    return this.repository.create({
      ...dto,
      slug,
      slugId,
      slugEn,
    });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.repository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found.`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    let slug = dto.slug;
    if (slug) {
      slug = slugify(slug, { lower: true, strict: true });
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category with slug '${slug}' already exists.`);
      }
    }

    const slugId = dto.slugId !== undefined ? (dto.slugId ? slugify(dto.slugId, { lower: true, strict: true }) : null) : undefined;
    const slugEn = dto.slugEn !== undefined ? (dto.slugEn ? slugify(dto.slugEn, { lower: true, strict: true }) : null) : undefined;

    return this.repository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
      ...(slugId !== undefined ? { slugId } : {}),
      ...(slugEn !== undefined ? { slugEn } : {}),
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}
