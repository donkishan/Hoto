import { Module } from '@nestjs/common';
import { SiteReadinessService } from './site-readiness.service';
import { SiteReadinessController } from './site-readiness.controller';

@Module({
  controllers: [SiteReadinessController],
  providers: [SiteReadinessService],
})
export class SiteReadinessModule {}
