// src/schemas/upload-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UploadLog extends Document {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  projectId: Types.ObjectId;  

  @Prop()
  blockId: Types.ObjectId;    

  @Prop()
  divisionId: Types.ObjectId;

  @Prop()
  hotoRequestId: Types.ObjectId;  

  @Prop()
  fileName: string;

  @Prop()
  uploadedOn: Date;

  @Prop()
  successCount: number;

  @Prop()
  failureCount: number;

  @Prop()
  downloadFilePath: string;
}

export const UploadLogSchema = SchemaFactory.createForClass(UploadLog);
