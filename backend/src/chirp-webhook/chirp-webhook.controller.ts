import { Controller } from '@nestjs/common';
import { ChirpWebhookService } from './chirp-webhook.service';
import { Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';

@Controller('chirp-webhook')
export class ChirpWebhookController {

  constructor(
    private readonly chirpWebhookService: ChirpWebhookService
  ) {}

  @MessagePattern(`application/${process.env.CHIRPSTACK_TEST_APPLICATION}/device/+/event/up`, Transport.MQTT)
  onWebhook(
    @Ctx() ctx: MqttContext
  ) {
    this.chirpWebhookService.onUplink(JSON.parse(ctx.getPacket().payload.toString()));
  }
}
