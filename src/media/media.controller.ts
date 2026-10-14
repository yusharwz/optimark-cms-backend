import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UpdateMediaAltDto } from './dto/update-media-alt.dto';
import { CreatePresignedUrlDto, ConfirmMediaUploadDto } from './dto/presigned-url.dto';
import { UploadedFileDto } from './media.interface';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() dto: CreatePresignedUrlDto) {
    if (!dto.filename || !dto.mimeType) {
      throw new BadRequestException('filename and mimeType are required.');
    }
    return this.mediaService.getPresignedUploadUrl(dto);
  }

  @Post('confirm')
  async confirmUpload(@Body() dto: ConfirmMediaUploadDto) {
    if (!dto.key || !dto.url) {
      throw new BadRequestException('key and url are required.');
    }
    return this.mediaService.confirmUpload(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: UploadedFileDto,
    @Body('altText') altText?: string,
    @Body('convertToWebp') convertToWebp?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required in multipart form-data.');
    }
    const shouldConvert = convertToWebp !== 'false';
    return this.mediaService.uploadFile(file, altText, shouldConvert);
  }

  @Get()
  async findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const l = limit ? parseInt(limit, 10) : 50;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.mediaService.findAll(l, o);
  }

  @Patch(':id/alt')
  async updateAlt(@Param('id') id: string, @Body() dto: UpdateMediaAltDto) {
    return this.mediaService.updateAltText(id, dto.altText);
  }
}
