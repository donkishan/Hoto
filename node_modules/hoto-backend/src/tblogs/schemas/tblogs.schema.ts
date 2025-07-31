// src/tblogs/schemas/tblog.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TBlogDocument = TBlog & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: false }  // ✅ disables updatedAt
})

export class TBlog {
  @Prop({ required: true })
  module: string;

  @Prop({ required: true })
  module_id: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  performedBy: string;

  @Prop()
  remarks: string;

  @Prop({ type: Object })
  rawData: Record<string, any>;
}

export const TBlogSchema = SchemaFactory.createForClass(TBlog);
