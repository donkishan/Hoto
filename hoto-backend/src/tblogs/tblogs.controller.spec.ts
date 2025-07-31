import { Test, TestingModule } from '@nestjs/testing';
import { TblogsController } from './tblogs.controller';
import { TblogsService } from './tblogs.service';

describe('TblogsController', () => {
  let controller: TblogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TblogsController],
      providers: [TblogsService],
    }).compile();

    controller = module.get<TblogsController>(TblogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
