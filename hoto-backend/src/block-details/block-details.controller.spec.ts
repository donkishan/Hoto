import { Test, TestingModule } from '@nestjs/testing';
import { BlockDetailsController } from './block-details.controller';
import { BlockDetailsService } from './block-details.service';

describe('BlockDetailsController', () => {
  let controller: BlockDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockDetailsController],
      providers: [BlockDetailsService],
    }).compile();

    controller = module.get<BlockDetailsController>(BlockDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
