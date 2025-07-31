import { Test, TestingModule } from '@nestjs/testing';
import { HotoRequestsController } from './hoto-requests.controller';
import { HotoRequestsService } from './hoto-requests.service';

describe('HotoRequestsController', () => {
  let controller: HotoRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotoRequestsController],
      providers: [HotoRequestsService],
    }).compile();

    controller = module.get<HotoRequestsController>(HotoRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
