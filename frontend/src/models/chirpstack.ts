export interface ChirpstackAppUplinkEvent {
  deduplicationId: string;
  time: string;
  deviceInfo: DeviceInfo;
  devAddr: string;
  adr: boolean;
  dr: number;
  fCnt: number;
  fPort: number;
  confirmed: boolean;
  data: string;
  rxInfo: RxInfo[];
  txInfo: TxInfo;
}

export interface DeviceInfo {
  tenantId: string;
  tenantName: string;
  applicationId: string;
  applicationName: string;
  deviceProfileId: string;
  deviceProfileName: string;
  deviceName: string;
  devEui: string;
  deviceClassEnabled: string;
  tags: Record<string, string>;
}

export interface RxInfo {
  gatewayId: string;
  uplinkId: number;
  gwTime: string;
  nsTime: string;
  timeSinceGpsEpoch: string;
  rssi: number;
  snr: number;
  channel: number;
  location: Location;
  context: string;
  metadata: Metadata;
  crcStatus: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Metadata {
  region_common_name: string;
  region_config_id: string;
}

export interface TxInfo {
  frequency: number;
  modulation: Modulation;
}

export interface Modulation {
  lora: LoraModulation;
}

export interface LoraModulation {
  bandwidth: number;
  spreadingFactor: number;
  codeRate: string;
}