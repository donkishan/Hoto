import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document{
 
  @Prop({ maxlength: 150, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ name: 'name' }) 
  name: string;
  
  @Prop({ name: 'mobile' }) 
  mobile: string;  

  @Prop({ name: 'role' }) 
  role: string;

  @Prop({ name: 'division' }) 
  division: string;
  
  @Prop({ name: 'profileImage' }) profileImage: string;  
}

export const UserSchema = SchemaFactory.createForClass(User);