import { Test, TestingModule } from '@nestjs/testing';
import { BlockDetailsService } from './block-details.service';

describe('BlockDetailsService', () => {
  let service: BlockDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockDetailsService],
    }).compile();

    service = module.get<BlockDetailsService>(BlockDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
