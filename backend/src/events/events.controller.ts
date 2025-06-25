import { Controller, Query, Sse, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth/jwt.guard';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {

  constructor(
    private readonly eventsService: EventsService
  ) {}

  // @UseGuards(JwtAuthGuard)
  @Sse("/packets")
  async getPings(@Query("token") token: string) {
    if (!token) {
      throw new Error("Token is required");
    }
    
    return this.eventsService.listenToApp()
  }
}
