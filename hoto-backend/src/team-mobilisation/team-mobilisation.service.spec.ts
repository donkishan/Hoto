import { Test, TestingModule } from '@nestjs/testing';
import { TeamMobilisationService } from './team-mobilisation.service';

describe('TeamMobilisationService', () => {
  let service: TeamMobilisationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamMobilisationService],
    }).compile();

    service = module.get<TeamMobilisationService>(TeamMobilisationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
