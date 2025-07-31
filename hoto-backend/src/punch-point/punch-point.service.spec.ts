import { Test, TestingModule } from '@nestjs/testing';
import { PunchPointService } from './services/punch-point.service';

describe('PunchPointService', () => {
  let service: PunchPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunchPointService],
    }).compile();

    service = module.get<PunchPointService>(PunchPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
