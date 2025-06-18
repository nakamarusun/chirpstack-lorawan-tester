export class DeviceConnectRequest {
  devEui: string;
  devAddr: string;
  nwkSKey: string;
  appSKey: string;
}

export class DownlinkRequest {
  devEui: string;
  fPort: number;
  data: string;
  confirmed?: boolean;
}