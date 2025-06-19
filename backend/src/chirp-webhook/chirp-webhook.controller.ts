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
    console.log("Received webhook data:", ctx.getPacket().payload.toString());
    this.chirpWebhookService.onUplink(ctx.getPacket().payload.toString());
  }
}
