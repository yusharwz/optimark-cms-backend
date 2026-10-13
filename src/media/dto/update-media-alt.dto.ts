import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMediaAltDto {
  @IsString()
  @IsNotEmpty()
  altText: string;
}
