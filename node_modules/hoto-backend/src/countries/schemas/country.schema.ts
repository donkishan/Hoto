import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Country extends Document {
  @Prop({ required: true })
  countryName: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ type: [String], required: true })
  timezones: string[];
}

export const CountrySchema = SchemaFactory.createForClass(Country);