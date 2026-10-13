import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PersonType } from '@prisma/client';

export class UpdatePersonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @IsEnum(PersonType)
  @IsOptional()
  type?: PersonType;
}
