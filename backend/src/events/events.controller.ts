import { Controller, Query, Sse, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse("/packets")
  async getPings(@Query("token") token: string) {
    if (!token) {
      throw new UnauthorizedException("Token is required");
    }
    try {
      this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    return this.eventsService.listenToApp();
  }
}
