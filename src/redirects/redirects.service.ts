import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RedirectsRepository } from './redirects.repository';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';

@Injectable()
export class RedirectsService {
  constructor(private readonly repository: RedirectsRepository) {}

  async create(dto: CreateRedirectDto) {
    const existing = await this.repository.findBySourcePath(dto.sourcePath);
    if (existing) {
      throw new ConflictException(`Redirect for path '${dto.sourcePath}' already exists.`);
    }
    return this.repository.create(dto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findById(id: string) {
    const redirect = await this.repository.findById(id);
    if (!redirect) {
      throw new NotFoundException(`Redirect with ID '${id}' not found.`);
    }
    return redirect;
  }

  async update(id: string, dto: UpdateRedirectDto) {
    await this.findById(id);
    if (dto.sourcePath) {
      const existing = await this.repository.findBySourcePath(dto.sourcePath);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Redirect for path '${dto.sourcePath}' already exists.`);
      }
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  /**
   * Helper to ensure redirect when article slug changes
   */
  async recordSlugChange(oldSlug: string, newSlug: string) {
    if (!oldSlug || !newSlug || oldSlug === newSlug) return null;

    const sourcePath = `/blog/${oldSlug}`;
    const targetPath = `/blog/${newSlug}`;

    const existing = await this.repository.findBySourcePath(sourcePath);
    if (existing) {
      return this.repository.update(existing.id, {
        targetPath,
        active: true,
        description: `Auto-updated slug redirect from ${oldSlug} to ${newSlug}`,
      });
    }

    return this.repository.create({
      sourcePath,
      targetPath,
      statusCode: 301,
      active: true,
      description: `Auto-created slug redirect from ${oldSlug} to ${newSlug}`,
    });
  }
}
