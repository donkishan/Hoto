import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document , Types} from 'mongoose';

export type ProjectDocument = Project & Document & { _id: Types.ObjectId };


@Schema()
export class Project {
 // Step 1 - Project Data
  @Prop({ required: true, unique: true }) projectId: string;
  @Prop({ required: true }) spvName: string;
  @Prop({ required: true }) projectName: string;
  @Prop({ required: true }) coordinates: string;
  @Prop({ required: true }) region: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true }) timezone: string;

  // Step 2 - Project Site Data
  @Prop({ required: true }) plantPower: string;
  @Prop({ required: true }) googleEarth: string;
  @Prop({ required: true }) constructionStart: string;
  @Prop({ required: true }) commissioning: string;
  @Prop({ required: true }) siteDescription: string;

  // Step 3 - Plant Configuration and Design
  @Prop({ required: true }) globalProject: string;
  @Prop({ required: true }) ratedCapacityDC: string;
  @Prop({ required: true }) ratedCapacityAC: string;
  @Prop({ required: true }) dcAcRatio: string;

  // Step 5 - PV System - Racking Design
  @Prop({ required: true }) orientation: string;
  @Prop({ required: true }) rowSpacing: string;
  @Prop({ required: true }) height: string;
  @Prop({ required: true }) gcr: string;
  @Prop({ required: true }) areaLimitations: string;
  @Prop({ required: true }) modulesPerString: string;
  @Prop({ required: true }) stringsPerInverter: string;
  @Prop({ required: true }) pnomRatio: string;
  @Prop({ required: true }) cleaningEvent: string;
  @Prop({ required: true }) roboticCleaning: string;
  @Prop()
  status: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ type: Date, default: null })
  last_update: Date;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);
