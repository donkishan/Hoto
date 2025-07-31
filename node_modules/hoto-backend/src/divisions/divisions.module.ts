import { Module } from '@nestjs/common';
import { DivisionsService } from './divisions.service';
import { DivisionsController } from './divisions.controller';
import { Division, DivisionSchema } from './schemas/division.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [DivisionsController],
  providers: [DivisionsService],
  imports:[
    MongooseModule.forFeature([{ name: Division.name, schema: DivisionSchema }])
  ]
})
export class DivisionsModule {}
