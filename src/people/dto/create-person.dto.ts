import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { PersonType } from '@prisma/client';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  roleEn?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  positionEn?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  bioId?: string;

  @IsString()
  @IsOptional()
  bioEn?: string;

  @IsArray()
  @IsOptional()
  expertiseId?: string[];

  @IsArray()
  @IsOptional()
  expertiseEn?: string[];

  @IsOptional()
  experienceId?: any;

  @IsOptional()
  experienceEn?: any;

  @IsOptional()
  educationId?: any;

  @IsOptional()
  educationEn?: any;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @IsEnum(PersonType)
  @IsOptional()
  type?: PersonType;

  // Credential fields
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  userRole?: string;
}
