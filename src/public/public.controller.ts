import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PublicService } from './public.service';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get('posts')
  getPosts(
    @Query('category') categorySlug?: string,
    @Query('categorySlug') categorySlugAlt?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 12;
    const cat = categorySlug || categorySlugAlt;
    return this.publicService.getPublishedPosts({ categorySlug: cat, tag, search, page: p, limit: l });
  }

  @Get('posts/:slug')
  async getPost(@Param('slug') slug: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.publicService.getPostBySlug(slug);
    if ('redirect' in result && result.redirect) {
      res.redirect(result.redirect.statusCode || 301, result.redirect.targetPath);
      return;
    }
    return result;
  }

  @Get('preview/:token')
  getPreview(@Param('token') token: string) {
    return this.publicService.getPreviewByToken(token);
  }

  @Get('authors/:slug')
  getAuthor(@Param('slug') slug: string) {
    return this.publicService.getAuthorProfile(slug);
  }

  @Get('redirects')
  getRedirects() {
    return this.publicService.getActiveRedirects();
  }

  @Get('sitemap.xml')
  async getSitemap(@Query('siteUrl') siteUrl: string, @Res() res: Response) {
    const xml = await this.publicService.generateSitemapXml(siteUrl || process.env.PUBLIC_SITE_URL);
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(HttpStatus.OK).send(xml);
  }

  /**
   * Comments API for Landing Page
   * Direct match for COMMENT_CONFIG.cmsApiUrl in optimark.landing-page
   */
  @Get('comments')
  getComments(@Query('slug') slug: string) {
    if (!slug) {
      return [];
    }
    return this.commentsService.getApprovedCommentsBySlug(slug);
  }

  @Post('comments')
  submitComment(@Body() dto: CreateCommentDto) {
    return this.commentsService.submitComment(dto);
  }

  @Get('posts/:slug/comments')
  getPostComments(@Param('slug') slug: string) {
    return this.commentsService.getApprovedCommentsBySlug(slug);
  }

  @Post('posts/:slug/comments')
  submitPostComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.submitComment({ ...dto, slug });
  }
}
