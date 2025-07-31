import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'site_readiness_images' })
export class SiteReadinessImage extends Document {
  @Prop({ required: true })
  project_id: string;

  @Prop({ required: true })
  block_id: string;

  @Prop({ required: true })
  site_readiness_activity_id: string;

  @Prop({ required: true })
  image_name: string[];

  @Prop({ required: true })
  image_original_name: string[];

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const SiteReadinessImageSchema = SchemaFactory.createForClass(SiteReadinessImage);
