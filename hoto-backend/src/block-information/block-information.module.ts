import { Module } from '@nestjs/common';
import { BlockInformationService } from './block-information.service';
import { BlockInformationController } from './block-information.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/schemas/user.schema';
import { BlockMemberSchema } from './schemas/block-member.schema';
import { BlockSchema } from '../hoto-requests/schemas/block.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'BlockMember', schema: BlockMemberSchema },
      { name: 'Block', schema: BlockSchema },

    ])
  ],
  controllers: [BlockInformationController],
  providers: [BlockInformationService],
  
})
export class BlockInformationModule {}
