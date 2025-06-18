import { Body, Controller, Post } from '@nestjs/common';
import { ChirpService } from './chirp.service';
import { DeviceConnectRequest, DownlinkRequest } from 'src/models/chirp';

@Controller('chirp')
export class ChirpController {

  constructor(
    private readonly chirpService: ChirpService,
  ) {}

  @Post("/onconnect")
  async onConnect(@Body() body: DeviceConnectRequest) {
    this.chirpService.onDeviceConnect(body);
  }

  @Post("/downlink")
  async onDownlink(@Body() body: DownlinkRequest) {
    this.chirpService.scheduleDownlink(body);
  }
}
