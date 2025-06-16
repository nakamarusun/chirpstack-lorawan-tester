import { Body, Controller, Post, Query } from '@nestjs/common';
import { ChirpWebhookService } from './chirp-webhook.service';

@Controller('chirp-webhook')
export class ChirpWebhookController {

  constructor(
    private readonly chirpWebhookService: ChirpWebhookService
  ) {}

  @Post('webhook')
  onWebhook(
    @Query("event") event: string,
    @Body() data: any,
  ) {
    switch (event) {
      case "uplink":
        return this.chirpWebhookService.onUplink(data);
      default:
        return { message: "Event not supported" };
    }
  }
}
