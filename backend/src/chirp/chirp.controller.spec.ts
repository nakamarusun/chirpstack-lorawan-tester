import { Test, TestingModule } from '@nestjs/testing';
import { ChirpController } from './chirp.controller';

describe('ChirpController', () => {
  let controller: ChirpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChirpController],
    }).compile();

    controller = module.get<ChirpController>(ChirpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
