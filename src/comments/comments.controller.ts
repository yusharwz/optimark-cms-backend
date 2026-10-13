import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { QueryCommentDto } from './dto/query-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(@Query() query: QueryCommentDto) {
    return this.commentsService.findAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.commentsService.getStats();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommentStatusDto,
  ) {
    return this.commentsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
