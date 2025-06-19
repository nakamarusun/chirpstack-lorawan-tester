export interface DeviceConnectRequest {
  devEui: string;
  devAddr: string;
  nwkSKey: string;
  appSKey: string;
}

export interface DownlinkRequest {
  devEui: string;
  fPort: number;
  data: string;
  confirmed?: boolean;
}