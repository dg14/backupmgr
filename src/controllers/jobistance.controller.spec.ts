import { Test, TestingModule } from '@nestjs/testing';
import { JobinstanceController } from './jobinstance.controller';

describe('JobinstanceController', () => {
  let controller: JobinstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobinstanceController],
    }).compile();

    controller = module.get<JobinstanceController>(JobinstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
