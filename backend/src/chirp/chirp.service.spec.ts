import { Test, TestingModule } from '@nestjs/testing';
import { ChirpService } from './chirp.service';

describe('ChirpService', () => {
  let service: ChirpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChirpService],
    }).compile();

    service = module.get<ChirpService>(ChirpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
