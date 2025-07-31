import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { Document, Types } from 'mongoose';

export type BlockDocument = Block & Document;

export enum acknowledgeStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGE = 'acknowledged',
}

@Schema({ timestamps: true })
export class Block {
  @Prop({ type: Types.ObjectId, ref: 'HotoRequest', required: true })
  hotoRequestId: Types.ObjectId; 

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  
  @Prop({ enum: acknowledgeStatus, default: acknowledgeStatus.PENDING })
  @IsEnum(acknowledgeStatus)
  acknowledgeStatus: acknowledgeStatus;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  acknowledgedBy:Types.ObjectId;
  
  @Prop({ type: Date, default: null })
  acknowledgedOn: Date;

  //asset team ack status
  @Prop({default: 'PENDING'})
  assetTeamAckStatus: string;

  @Prop({default: null})
  assetTeamAckRaisedBy : Types.ObjectId;

  @Prop({type: Date, default:null})
  assetTeamAckRaisedDate : Date;

  @Prop({default: null})
  assetTeamAckBy : Types.ObjectId;


  @Prop({type: Date, default:null})
  assetTeamAckDate : Date;

  //quality team ack status
  @Prop({default: 'PENDING'})
  qualityTeamAckStatus: string;

  @Prop({default: null})
  qualityTeamAckRaisedBy: Types.ObjectId;

  @Prop({type: Date, default:null})
  qualityTeamAckRaisedDate: Date;

  @Prop({default: null})
  qualityTeamAckBy: Types.ObjectId;

  @Prop({type: Date, default:null})
  qualityTeamAckDate: Date;
  
  //asset team punch point status
  @Prop({default: 'PENDING'})
  assetTeamPunchPointStatus: string;

  @Prop({default: null})
  assetTeamPunchPointBy : Types.ObjectId;

  @Prop({type: Date, default:null})
  assetTeamPunchPointRaisedDate : Date;

  @Prop({default: null})
  assetTeamPunchPointAckBy : Types.ObjectId;

  @Prop({type: Date, default:null})
  assetTeamPunchPointAckDate : Date;

  //quality team punch point status
  @Prop({default: 'PENDING'})
  qualityTeamPunchPointStatus: string;

  @Prop({default: null})
  qualityTeamPunchPointBy : Types.ObjectId;

  @Prop({type: Date, default:null})
  qualityTeamPunchPointRaisedDate : Date;

  @Prop({default: null})
  qualityTeamPunchPointAckBy : Types.ObjectId;

  @Prop({type: Date, default:null})
  qualityTeamPunchPointAckDate : Date;

}

export const BlockSchema = SchemaFactory.createForClass(Block);
