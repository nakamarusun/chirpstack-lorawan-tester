import { Injectable } from '@nestjs/common';

@Injectable()
export class ChirpWebhookService {
  onUplink(data: any) {
    console.log('Uplink data received:', data);
  }
}
