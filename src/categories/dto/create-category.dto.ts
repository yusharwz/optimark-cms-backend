import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameId?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

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
  description?: string;

  @IsString()
  @IsOptional()
  descriptionId?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  metaTitleId?: string;

  @IsString()
  @IsOptional()
  metaTitleEn?: string;

  @IsString()
  @IsOptional()
  metaDescriptionId?: string;

  @IsString()
  @IsOptional()
  metaDescriptionEn?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
