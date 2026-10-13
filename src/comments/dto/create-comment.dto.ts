import { IsNotEmpty, IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  authorName: string;

  @IsNotEmpty()
  @IsEmail()
  authorEmail: string;

  @IsOptional()
  @IsString()
  authorWebsite?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1500)
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
