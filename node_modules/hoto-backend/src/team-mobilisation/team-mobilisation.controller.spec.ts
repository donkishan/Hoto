import { Test, TestingModule } from '@nestjs/testing';
import { TeamMobilisationController } from './team-mobilisation.controller';
import { TeamMobilisationService } from './team-mobilisation.service';

describe('TeamMobilisationController', () => {
  let controller: TeamMobilisationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMobilisationController],
      providers: [TeamMobilisationService],
    }).compile();

    controller = module.get<TeamMobilisationController>(TeamMobilisationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
