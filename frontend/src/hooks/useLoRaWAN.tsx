import { createContext, useContext, useEffect, useState } from "react";
import useSerial from "./useSerial"
import { nanoIDRandomHex } from "../tools";
import { onDeviceConnected } from "../service/device";
import type { DeviceConnectRequest } from "../../../backend/src/models/chirp";

interface LoRaWANContext {
  setFrequency: (frequency: number) => Promise<void>;
  frequency: number;
  setDR: (dataRate: number) => Promise<void>;
  dataRate: number;

  setTxPower: (txPower: number) => Promise<void>;
  txPower: number;

  resetKeys: () => Promise<void>;

  send: (fPort: number, data: string) => Promise<void>;

  setDevAddr: (devAddr: string) => Promise<void>;
  devAddr: string;
  setAppSKey: (appSKey: string) => Promise<void>;
  appSKey: string;
  setNwkSKey: (nwkSKey: string) => Promise<void>;
  nwkSKey: string;
  setDevEui: (devEui: string) => Promise<void>;
  devEui: string;
}

function trimValueFromAt(value: string): string {
  return value.split("\n")[0].trim();
}

export function LoRaWANProvider({children}: {children: React.ReactNode}) {
  const serial = useSerial();

  const [devEui, setDevEui] = useState("000000000000000");
  const [devAddr, setDevAddr] = useState("00000000");
  const [nwkSKey, setNwkSKey] = useState("00000000000000000000000000000000");
  const [appSKey, setAppSKey] = useState("00000000000000000000000000000000");

  const [frequency, setFrequency] = useState(868100000);
  const [dataRate, setDataRate] = useState(5);
  const [txPower, setTxPower] = useState(14);

  function connectToServer({
    devAddr,
    nwkSKey,
    appSKey,
    devEui
  }: DeviceConnectRequest) {
    return onDeviceConnected({
      devEui,
      devAddr,
      nwkSKey,
      appSKey,
    });
  }

  useEffect(() => {
    if (serial.state !== "connected") return;

    (async () => {
      const devEui = trimValueFromAt(await serial.sendAndWait("AT+DEVEUI=?", 1000));
      setDevEui(devEui);
      const devAddr = trimValueFromAt(await serial.sendAndWait("AT+DEVADDR=?", 1000));
      setDevAddr(devAddr);
      const nwkSKey = trimValueFromAt(await serial.sendAndWait("AT+NWKSKEY=?", 1000));
      setNwkSKey(nwkSKey);
      const appSKey = trimValueFromAt(await serial.sendAndWait("AT+APPSKEY=?", 1000));
      setAppSKey(appSKey);

      setFrequency(parseInt(trimValueFromAt(await serial.sendAndWait("AT+FREQ=?", 1000))));
      setDataRate(parseInt(trimValueFromAt(await serial.sendAndWait("AT+DR=?", 1000))));
      setTxPower(parseInt(trimValueFromAt(await serial.sendAndWait("AT+TXP=?", 1000))));
      await connectToServer({
        devEui,
        devAddr,
        nwkSKey,
        appSKey,
      });

    })();
  }, [serial.state]);

  const hooks: LoRaWANContext = {
    devAddr,
    nwkSKey,
    appSKey,
    devEui,
    frequency,
    dataRate,
    txPower,
    resetKeys: async () => {
      const nwkSKey = nanoIDRandomHex(32);
      const appSKey = nanoIDRandomHex(32);
      await hooks.setNwkSKey(nwkSKey);
      await hooks.setAppSKey(appSKey);

      await connectToServer({
        devEui,
        devAddr,
        nwkSKey,
        appSKey,
      });
    },
    setDevAddr: async (devAddr: string) => {
      setDevAddr(devAddr);
      await serial.sendAndWait(`AT+DEVADDR=${devAddr}`);
    },
    setNwkSKey: async (nwkSKey: string) => {
      setNwkSKey(nwkSKey);
      await serial.sendAndWait(`AT+NWKSKEY=${nwkSKey}`);
    },
    setAppSKey: async (appSKey: string) => {
      setAppSKey(appSKey);
      await serial.sendAndWait(`AT+APPSKEY=${appSKey}`);
    },
    setFrequency: async (frequency: number) => {
      setFrequency(frequency);
      if (frequency < 400000000 || frequency > 950000000) {
        throw new Error("Frequency out of range");
      }
      await serial.sendAndWait(`AT+FREQ=${frequency}`);
    },
    setDR: async (dataRate: number) => {
      setDataRate(dataRate);
      await serial.sendAndWait(`AT+DR=${dataRate}`);
    },
    setTxPower: async (txPower: number) => {
      setTxPower(txPower);
      await serial.sendAndWait(`AT+TXPOWER=${txPower}`);
    },
    send: async (fPort: number, data: string) => {
      await serial.sendData(`AT+SEND=${fPort}:${data}`);
    },
    setDevEui: async (devEui: string) => {
      setDevEui(devEui);
      await serial.sendAndWait(`AT+DEVEUI=${devEui}`);
    },
  }

  return <LoRaWANContext.Provider value={hooks}>
    {children}
  </LoRaWANContext.Provider>;
}

export const LoRaWANContext = createContext<LoRaWANContext | null>(null);

export function useLoRaWAN() {
  const context = useContext(LoRaWANContext);
  if (!context) {
    throw new Error("useLoRaWAN not used in LoRaWANProvider");
  }
  return context;
}

export default useLoRaWAN;