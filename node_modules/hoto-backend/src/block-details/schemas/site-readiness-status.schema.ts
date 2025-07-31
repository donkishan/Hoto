import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'site_readiness_status' })
export class SiteReadinessStatus extends Document {
  @Prop({ required: true })
  project_id: string;

  @Prop({ required: true })
  block_id: string;

  @Prop({ required: true })
  site_readiness_activity_id: string;

  @Prop()
  status: string;

  @Prop()
  certificate: string;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const SiteReadinessStatusSchema = SchemaFactory.createForClass(SiteReadinessStatus);
