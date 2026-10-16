import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateRedirectDto {
  @IsString()
  @IsOptional()
  sourcePath?: string;

  @IsString()
  @IsOptional()
  targetPath?: string;

  @IsInt()
  @IsOptional()
  statusCode?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
