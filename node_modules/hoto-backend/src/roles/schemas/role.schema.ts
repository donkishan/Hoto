import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema()
export class Role {
  @Prop({ required: true, unique: true })
  role_name: string;

  @Prop({ required: true })
  created_by: string;
  
  @Prop({ required: true })
  mst_divisions_id: string;
  

  @Prop({ type: Date, default: () => new Date() })
  create_date: Date;

  @Prop({ type: Date, default: () => new Date() })
  last_update: Date;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_delete: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
