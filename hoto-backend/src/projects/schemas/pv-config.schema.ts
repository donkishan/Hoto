import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PvConfigurationDocument = PvConfiguration & Document;

@Schema({ timestamps: true })
export class PvConfiguration {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true }) solarModule: string;
  @Prop({ required: true }) solarPower: string;
  @Prop({ required: true }) solarCount: string;
  @Prop({ required: true }) inverter: string;
  @Prop({ required: true }) inverterPower: string;
  @Prop({ required: true }) inverterCount: string;
  @Prop({ required: true }) installationType: string;
  @Prop({ required: true }) trackingSystem: string;
}

export const PvConfigurationSchema = SchemaFactory.createForClass(PvConfiguration);
