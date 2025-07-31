// src/divisions/schemas/division.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DivisionDocument = Division & Document;

@Schema({ timestamps: true })
export class Division {
  @Prop({ required: true })
  divisionCode: string;

  @Prop({ required: true })
  divisionName: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_delete: boolean;
}

export const DivisionSchema = SchemaFactory.createForClass(Division);
