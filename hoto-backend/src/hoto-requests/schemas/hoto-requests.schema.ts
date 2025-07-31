// schemas/hotoRequest.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Document, Types } from 'mongoose';

export type HotoRequestDocument = HotoRequest & Document;
export enum acknowledgeStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGE = 'acknowledged',
}

@Schema({ timestamps: true })
export class HotoRequest {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  projectCode: string;

  @Prop()
  capacity: string;

  @Prop({ required: true })
  completionType: string;

  @Prop({ required: true })
  initiatedDate: string;

  @Prop({ required: true })
  initiatedById: string;

  @Prop()
  codDate: string;

  @Prop()
  status: string; 

  @Prop()
  certificatePath: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ enum: acknowledgeStatus, default: acknowledgeStatus.PENDING })
  @IsEnum(acknowledgeStatus)
  acknowledgeStatus: acknowledgeStatus;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  acknowledgedBy:Types.ObjectId;
  
  @Prop({ type: Date, default: null })
  acknowledgedOn: Date;

  @Prop()
  hotoFor: string;  

  @Prop()
  hotoCapacity: string;  
}

export const HotoRequestSchema = SchemaFactory.createForClass(HotoRequest);
