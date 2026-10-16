import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  slugId?: string;

  @IsString()
  @IsOptional()
  slugEn?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  coverImageAlt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsOptional()
  reviewerId?: string;

  @IsOptional()
  translations?: {
    id?: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      metaTitle?: string;
      metaDescription?: string;
    };
    en?: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      metaTitle?: string;
      metaDescription?: string;
    };
  };

  @IsInt()
  @IsOptional()
  readMinutes?: number;
}
