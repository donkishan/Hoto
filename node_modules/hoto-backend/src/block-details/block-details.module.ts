import { Module } from '@nestjs/common';
import { BlockDetailsService } from './block-details.service';
import { BlockDetailsController } from './block-details.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteReadinessStatus, SiteReadinessStatusSchema } from './schemas/site-readiness-status.schema';
import { SiteReadinessImage, SiteReadinessImageSchema } from './schemas/site-readiness-image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteReadinessStatus.name, schema: SiteReadinessStatusSchema },
      { name: SiteReadinessImage.name, schema: SiteReadinessImageSchema },
    ]),
  ],
  controllers: [BlockDetailsController],
  providers: [BlockDetailsService],
})
export class BlockDetailsModule { }
