import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { Document, Types } from 'mongoose';

export type PunchPointDocument = PunchPoint & Document;
export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum acknowledgeStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGE = 'acknowledged',
}
@Schema({ timestamps: true })
export class PunchPoint {
  
  @Prop() 
  location: string;

  @Prop() 
  description: string;

  @Prop() 
  area: string;

  @Prop() 
  categoryWork: string;

  @Prop() 
  team: string;

  @Prop() 
  category: string;

  @Prop() 
  remarks: string;

  @Prop({ type: Date, default: () => new Date() })
  createdOn: Date;
  
  @Prop({ type: Types.ObjectId, ref: 'Division' })
  divisionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Block' })
  blockId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hoto Request Id' })
  hotoRequestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project Id' })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User Id' })
  userId: Types.ObjectId;
  
  @Prop() 
  prImpacted: string;

  @Prop() 
  targetClosureDate: string;
  
  @Prop() 
  projectRemarks:string;
  
  @Prop({default:null}) 
  representative_name: string;

  @Prop({default:null}) 
  project_team_remarks: string;

  @Prop()
  target_closure_date: string; 
  
  @Prop({default:'NO'}) 
  pr_impacted: string;
  
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

  @Prop({ enum: Status, default: Status.PENDING })
  @IsEnum(Status)
  status: Status;

  @Prop()
  actual_closure_date: string; 
  
  @Prop()
  statusUpdatedBy: Types.ObjectId; 
}

export const PunchPointSchema = SchemaFactory.createForClass(PunchPoint);
