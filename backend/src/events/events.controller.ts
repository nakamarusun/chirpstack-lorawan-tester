import { Controller, Sse, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth/jwt.guard';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {

  constructor(
    private readonly eventsService: EventsService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Sse("/packets")
  async getPings() {
    return this.eventsService.listenToApp()
  }
}
