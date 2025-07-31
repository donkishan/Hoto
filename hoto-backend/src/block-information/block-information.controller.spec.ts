import { Test, TestingModule } from '@nestjs/testing';
import { BlockInformationController } from './block-information.controller';
import { BlockInformationService } from './block-information.service';

describe('BlockInformationController', () => {
  let controller: BlockInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockInformationController],
      providers: [BlockInformationService],
    }).compile();

    controller = module.get<BlockInformationController>(BlockInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
