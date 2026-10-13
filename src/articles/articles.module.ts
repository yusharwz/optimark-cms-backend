import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesScheduler } from './articles.scheduler';
import { RedirectsModule } from '../redirects/redirects.module';

@Module({
  imports: [RedirectsModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesRepository, ArticlesScheduler],
  exports: [ArticlesService, ArticlesRepository],
})
export class ArticlesModule {}
