import { Test, TestingModule } from '@nestjs/testing';
import { BlockInformationService } from './block-information.service';

describe('BlockInformationService', () => {
  let service: BlockInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockInformationService],
    }).compile();

    service = module.get<BlockInformationService>(BlockInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
