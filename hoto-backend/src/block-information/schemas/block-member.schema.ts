import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'block_members' })
export class BlockMember extends Document{
    @Prop()
    block_id: Types.ObjectId;

    @Prop()
    division: Types.ObjectId;

    @Prop()
    assigned_by: Types.ObjectId;

    @Prop()
    assigned_user: Types.ObjectId;

    @Prop()
    hotoRequestId: Types.ObjectId;

    @Prop()
    projectId: Types.ObjectId;

    @Prop({ default: Date.now })
    create_date: Date;
  
    @Prop({ type: Date, default: null })
    last_update: Date;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_delete: boolean;

}

export const BlockMemberSchema = SchemaFactory.createForClass(BlockMember);