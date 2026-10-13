import { IsNotEmpty, IsEnum } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class UpdateCommentStatusDto {
  @IsNotEmpty()
  @IsEnum(CommentStatus)
  status: CommentStatus;
}
