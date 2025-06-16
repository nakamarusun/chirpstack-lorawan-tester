import { Test, TestingModule } from '@nestjs/testing';
import { ChirpWebhookService } from './chirp-webhook.service';

describe('ChirpWebhookService', () => {
  let service: ChirpWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChirpWebhookService],
    }).compile();

    service = module.get<ChirpWebhookService>(ChirpWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
