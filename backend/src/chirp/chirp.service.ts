import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceConnectRequest, DownlinkRequest } from 'src/models/chirp';
import { nanoid } from 'nanoid';

export enum DeviceChirpstackStatus {
  NOT_REGISTERED,
  REGISTERED,
  WRONG_KEYS,
}

@Injectable()
export class ChirpService {
  private chirpAppId: string;
  private chirpApi: string;
  private chirpKey: string;
  private deviceProfile: string;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.chirpAppId = this.config.get<string>("CHIRPSTACK_TEST_APPLICATION");
    this.chirpApi = this.config.get<string>("CHIRPSTACK_API_URL");
    this.chirpKey = this.config.get<string>("CHIRPSTACK_API_KEY");
    this.deviceProfile = this.config.get<string>("CHIRPSTACK_DEVICE_PROFILE_ID");
  }

  async scheduleDownlink({
    devEui,
    fPort,
    data,
    confirmed = false}: DownlinkRequest) {

    // First, get fcntdown
    const fcntdownResponse = await fetch(`${this.chirpApi}/api/devices/${devEui}/get-next-f-cnt-down`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      }
    });
    if (!fcntdownResponse.ok) {
      throw new Error(`Failed to get next FCntDown for device ${devEui}`);
    }
    const fcntdownData = await fcntdownResponse.json();
    const fCntDown = fcntdownData.fCntDown;

    const downlinkId = nanoid(16);
    const downlinkData = {
      queueItem: {
        confirmed: confirmed,
        data: data,
        fCntDown: fCntDown,
        fPort: fPort,
        id: downlinkId,
        isEncrypted: true,
        isPending: true,
      }
    };
    const response = await fetch(`${this.chirpApi}/api/devices/${devEui}/queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      },
      body: JSON.stringify(downlinkData)
    });
    if (!response.ok) {
      throw new Error(`Failed to schedule downlink for device ${devEui}: ${response.statusText}`);
    }
    return await response.json();
  }

  async registerDevice(conReq: DeviceConnectRequest) {
    const regBuilder = {
      device: {
        applicationId: this.chirpAppId,
        description: `Autogenerated by swm-backend on ${(new Date()).toISOString()}`,
        devEui: conReq.devEui,
        deviceProfileId: this.deviceProfile,
        isDisabled: false,
        joinEui: "0000000000000000",
        name: `tester-${conReq.devEui.substring(8, 16)}`,
        skipFcntCheck: true,
      }
    };

    // Create device
    const response = await fetch(`${this.chirpApi}/api/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      },
      body: JSON.stringify(regBuilder)
    });
    if (!response.ok) {
      throw new Error(`Failed to register device ${conReq.devEui}: ${response.statusText}`);
    }
    return await response.json();
  }

  async checkDeviceExists(conReq: DeviceConnectRequest): Promise<DeviceChirpstackStatus> {
    const device = await fetch(`${this.chirpApi}/api/devices/${conReq.devEui}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      }
    });
    if (!device.ok) {
      return DeviceChirpstackStatus.NOT_REGISTERED;
    }

    const activated = await fetch(`${this.chirpApi}/api/devices/${conReq.devEui}/activation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      }
    });
    if (!activated.ok) {
      return DeviceChirpstackStatus.NOT_REGISTERED;
    }
    const activationData = await activated.json();
    if (activationData.deviceActivation) {
      // Device is registered but keys might be wrong
      if (activationData.deviceActivation.appSKey !== conReq.appSKey ||
          activationData.deviceActivation.nwkSEncKey !== conReq.nwkSKey ||
          activationData.deviceActivation.sNwkSIntKey !== conReq.nwkSKey ||
          activationData.deviceActivation.fNwkSIntKey !== conReq.nwkSKey) {
        return DeviceChirpstackStatus.WRONG_KEYS;
      }
      return DeviceChirpstackStatus.REGISTERED;
    }

    // Implement your logic to check if the device exists
    return DeviceChirpstackStatus.NOT_REGISTERED;
  }

  async activateDevice(conReq: DeviceConnectRequest) {
    const activation = {
      deviceActivation: {
        devAddr: conReq.devAddr,
        fCntUp: 0,
        nFCntDown: 0,
        aFCntDown: 0,
        appSKey: conReq.appSKey,
        nwkSEncKey: conReq.nwkSKey,
        sNwkSIntKey: conReq.nwkSKey,
        fNwkSIntKey: conReq.nwkSKey,
      }
    };

    // Activate ABP
    const response = await fetch(`${this.chirpApi}/api/devices/${conReq.devEui}/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.chirpKey}`
      },
      body: JSON.stringify(activation)
    });
    if (!response.ok) {
      throw new Error(`Failed to activate device ${conReq.devEui}: ${response.statusText}`);
    }
    return await response.json();
  }

  async onDeviceConnect(conReq: DeviceConnectRequest) {
    const status = await this.checkDeviceExists(conReq);
    if (status === DeviceChirpstackStatus.NOT_REGISTERED) {
      await this.registerDevice(conReq);
      await this.activateDevice(conReq);
    } else if (status === DeviceChirpstackStatus.WRONG_KEYS) {
      await this.activateDevice(conReq);
    }
  }
}
