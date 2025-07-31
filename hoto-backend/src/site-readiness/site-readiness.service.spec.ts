import { Test, TestingModule } from '@nestjs/testing';
import { SiteReadinessService } from './site-readiness.service';

describe('SiteReadinessService', () => {
  let service: SiteReadinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteReadinessService],
    }).compile();

    service = module.get<SiteReadinessService>(SiteReadinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
