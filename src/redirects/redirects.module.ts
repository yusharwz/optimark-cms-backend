import { Module } from '@nestjs/common';
import { RedirectsService } from './redirects.service';
import { RedirectsController } from './redirects.controller';
import { RedirectsRepository } from './redirects.repository';

@Module({
  controllers: [RedirectsController],
  providers: [RedirectsService, RedirectsRepository],
  exports: [RedirectsService, RedirectsRepository],
})
export class RedirectsModule {}
