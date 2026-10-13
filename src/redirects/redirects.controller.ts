import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { RedirectsService } from './redirects.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';

@Controller('redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRedirectDto: CreateRedirectDto) {
    return this.redirectsService.create(createRedirectDto);
  }

  @Get()
  findAll() {
    return this.redirectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redirectsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRedirectDto: UpdateRedirectDto) {
    return this.redirectsService.update(id, updateRedirectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.redirectsService.remove(id);
  }
}
