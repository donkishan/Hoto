import { Test, TestingModule } from '@nestjs/testing';
import { SiteReadinessController } from './site-readiness.controller';
import { SiteReadinessService } from './site-readiness.service';

describe('SiteReadinessController', () => {
  let controller: SiteReadinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteReadinessController],
      providers: [SiteReadinessService],
    }).compile();

    controller = module.get<SiteReadinessController>(SiteReadinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
