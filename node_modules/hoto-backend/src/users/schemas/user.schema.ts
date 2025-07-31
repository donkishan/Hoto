import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
 
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  division: string;

  @Prop({ required: true })
  role: string;
  
  @Prop({ required: true })
  password: string;
  
  @Prop()
  plainPassword?: string;

  @Prop()
  profileImage: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ type: Date, default: () => new Date() })
  create_date: Date;

  @Prop({ type: Date, default: () => new Date() })
  last_update: Date;

  @Prop()
  hotoFor: string;

  @Prop()
  hotoCapacity: string;

  @Prop({default:"TEAM"})
  user_type : string;

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt();
  // this.password = await bcrypt.hash(this.password, salt);
  next();
});
