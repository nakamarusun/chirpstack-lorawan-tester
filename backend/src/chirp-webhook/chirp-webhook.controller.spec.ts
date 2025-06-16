import { Test, TestingModule } from '@nestjs/testing';
import { ChirpWebhookController } from './chirp-webhook.controller';

describe('ChirpWebhookController', () => {
  let controller: ChirpWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChirpWebhookController],
    }).compile();

    controller = module.get<ChirpWebhookController>(ChirpWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
