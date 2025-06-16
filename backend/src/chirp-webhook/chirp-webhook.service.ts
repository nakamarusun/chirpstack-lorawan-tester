import { Injectable } from '@nestjs/common';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class ChirpWebhookService {

  constructor(
    private readonly eventsService: EventsService
  ) {}

  onUplink(data: any) {
    this.eventsService.advanceSubject(JSON.stringify(data));
  }
}
