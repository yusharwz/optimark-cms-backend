import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
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
