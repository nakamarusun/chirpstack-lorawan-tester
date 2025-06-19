import { createContext, useContext, useEffect, useState } from "react";
import useSerial from "./useSerial"
import { nanoIDRandomHex } from "../tools";
import { onDeviceConnected } from "../service/device";
import type { DeviceConnectRequest } from "../../../backend/src/models/chirp";

interface SignalStrength {
  rssi: number;
  snr: number;
}

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

  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;

  sendCounter: number;
  signal: SignalStrength;
}

function trimValueFromAt(value: string): string {
  return value.split("\n")[0].trim();
}

export function LoRaWANProvider({children}: {children: React.ReactNode}) {
  const serial = useSerial();

  const [devEui, setDevEui] = useState("");
  const [devAddr, setDevAddr] = useState("");
  const [nwkSKey, setNwkSKey] = useState("");
  const [appSKey, setAppSKey] = useState("");

  const [frequency, setFrequency] = useState(0);
  const [dataRate, setDataRate] = useState(5);
  const [txPower, setTxPower] = useState(0);

  const [confirmed, setConfirmed] = useState(false);

  const [sendCounter, setSendCounter] = useState(0);
  const [signal, setSignal] = useState<SignalStrength>({
    rssi: 0,
    snr: 0,
  });

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
    sendCounter,
    signal,
    confirmed,
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
      await serial.sendAndWait(`AT+DEVADDR=${devAddr}`);
      setDevAddr(devAddr);
    },
    setNwkSKey: async (nwkSKey: string) => {
      await serial.sendAndWait(`AT+NWKSKEY=${nwkSKey}`);
      setNwkSKey(nwkSKey);
    },
    setAppSKey: async (appSKey: string) => {
      await serial.sendAndWait(`AT+APPSKEY=${appSKey}`);
      setAppSKey(appSKey);
    },
    setFrequency: async (frequency: number) => {
      if (frequency < 400000000 || frequency > 950000000) {
        throw new Error("Frequency out of range");
      }
      await serial.sendAndWait(`AT+FREQ=${frequency}`);
      setFrequency(frequency);
    },
    setDR: async (dataRate: number) => {
      await serial.sendAndWait(`AT+DR=${dataRate}`);
      setDataRate(dataRate);
    },
    setTxPower: async (txPower: number) => {
      await serial.sendAndWait(`AT+TXP=${txPower}`);
      setTxPower(txPower);
    },
    send: async (fPort: number, data: string) => {
      if (fPort < 1 || fPort > 223) {
        throw new Error("fPort must be between 1 and 223");
      }
      if (data.length > 255 * 2) {
        throw new Error("Payload must be less than 255 characters");
      }
      setSendCounter((prev) => prev + 1);
      await serial.sendAndWait(`AT+SEND=${fPort}:${data}`, 10000);

      // Get the signal strength after sending
      const rssi = parseInt(trimValueFromAt(await serial.sendAndWait("AT+RSSI=?", 1000)));
      const snr = parseInt(trimValueFromAt(await serial.sendAndWait("AT+SNR=?", 1000)));
      setSignal({ rssi, snr });
    },
    setDevEui: async (devEui: string) => {
      await serial.sendAndWait(`AT+DEVEUI=${devEui}`);
      setDevEui(devEui);
    },
    setConfirmed: async (confirmed: boolean) => {
      await serial.sendAndWait(`AT+CFM=${confirmed ? 1 : 0}`);
      setConfirmed(confirmed);
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