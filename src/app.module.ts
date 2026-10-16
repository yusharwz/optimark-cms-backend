import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { PeopleModule } from './people/people.module';
import { RedirectsModule } from './redirects/redirects.module';
import { MediaModule } from './media/media.module';
import { PublicModule } from './public/public.module';
import { CommentsModule } from './comments/comments.module';
import { SeedModule } from './seed/seed.module';
import { LandingSyncModule } from './landing-sync/landing-sync.module';
import { RevalidationModule } from './revalidation/revalidation.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ArticlesModule,
    CategoriesModule,
    PeopleModule,
    RedirectsModule,
    MediaModule,
    PublicModule,
    CommentsModule,
    SeedModule,
    LandingSyncModule,
    RevalidationModule,
  ],
})
export class AppModule {}
