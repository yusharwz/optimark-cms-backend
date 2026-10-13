import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateRedirectDto {
  @IsString()
  @IsNotEmpty()
  sourcePath: string;

  @IsString()
  @IsNotEmpty()
  targetPath: string;

  @IsInt()
  @IsOptional()
  statusCode?: number = 301;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @IsString()
  @IsOptional()
  description?: string;
}
