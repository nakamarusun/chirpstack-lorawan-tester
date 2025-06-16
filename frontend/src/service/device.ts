import { DeviceConnectRequest, DownlinkRequest } from "../../../backend/src/models/chirp";
import config from "../config";

export function onDeviceConnected(devCon: DeviceConnectRequest): Promise<any> {
  return fetch(`${config.baseUrl}/chirp/onconnect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(devCon),
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Device connection failed: ${response.statusText}`);
    }
    return response.json();
  })
}

export function scheduleDownlink(downlink: DownlinkRequest): Promise<any> {
  return fetch(`${config.baseUrl}/chirp/downlink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(downlink),
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Downlink scheduling failed: ${response.statusText}`);
    }
    return response.json();
  });
}