import { Test, TestingModule } from '@nestjs/testing';
import { TblogsService } from './tblogs.service';

describe('TblogsService', () => {
  let service: TblogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TblogsService],
    }).compile();

    service = module.get<TblogsService>(TblogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
