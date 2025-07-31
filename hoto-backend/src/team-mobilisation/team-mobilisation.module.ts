import { Module } from '@nestjs/common';
import { TeamMobilisationService } from './team-mobilisation.service';
import { TeamMobilisationController } from './team-mobilisation.controller';

@Module({
  controllers: [TeamMobilisationController],
  providers: [TeamMobilisationService],
})
export class TeamMobilisationModule {}
