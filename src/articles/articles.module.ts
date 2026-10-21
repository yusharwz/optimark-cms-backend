import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesScheduler } from './articles.scheduler';
import { RedirectsModule } from '../redirects/redirects.module';
import { LandingSyncModule } from '../landing-sync/landing-sync.module';
import { RevalidationModule } from '../revalidation/revalidation.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [RedirectsModule, LandingSyncModule, RevalidationModule, MediaModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesRepository, ArticlesScheduler],
  exports: [ArticlesService, ArticlesRepository],
})
export class ArticlesModule {}
