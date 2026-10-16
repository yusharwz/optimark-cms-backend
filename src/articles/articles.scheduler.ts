import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticlesService } from './articles.service';

@Injectable()
export class ArticlesScheduler {
  private readonly logger = new Logger(ArticlesScheduler.name);

  constructor(private readonly articlesService: ArticlesService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledArticles() {
    try {
      const count = await this.articlesService.processScheduledPublishing();
      if (count > 0) {
        this.logger.log(`Published ${count} scheduled articles successfully.`);
      }
    } catch (err) {
      this.logger.error('Failed to process scheduled articles:', err);
    }
  }
}
