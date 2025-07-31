import { Test, TestingModule } from '@nestjs/testing';
import { HotoRequestsService } from './hoto-requests.service';

describe('HotoRequestsService', () => {
  let service: HotoRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotoRequestsService],
    }).compile();

    service = module.get<HotoRequestsService>(HotoRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
