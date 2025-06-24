import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Capacitor } from '@capacitor/core';
import {UsbSerial, type UsbSerialPlugin} from 'capacitor-usb-serial-plugin'

export type DataBitsType = 7 | 8;
export type StopBitsType = 1 | 2;
export type EnterSendsType = "" | "\r" | "\n" | "\r\n";
export type SerialConnectionType = "connected" | "disconnected";

export type SerialOnDataNotify = (data: string) => void

// export type SerialUsed = typeof serialPolyfill;
// export type SerialPortUsed = SerialPortPolyfill;
export type SerialUsed = Serial;
export type SerialPortUsed = SerialPort;

export interface UsbSerialDeviceAndroidType {
  deviceId: number;
  productName: string;
  vendorId: number;
  productId: number;
}

export interface UsbSerialForAndroidFullType {
  device: UsbSerialDeviceAndroidType;
  port: number;
  driver: string;
}

interface SerialContext {
  sendData(data: string): Promise<void>;
  sendAndWait(data: string, timeout?: number): Promise<string>;
  onDataReceived(callback: SerialOnDataNotify): void;
  releaseOnDataReceived(callback: SerialOnDataNotify): void;
  onDataSent(callback: SerialOnDataNotify): void;
  releaseDataSent(callback: SerialOnDataNotify): void;
  closeConnection(): Promise<void>;
  openConnection(
    baud: number,
    flowControl: FlowControlType,
    parity: ParityType,
    dataBits: DataBitsType,
    stopBits: StopBitsType,
    enterSends: EnterSendsType
  ): Promise<void>;
  state: SerialConnectionType;
}

export function SerialProvider({ children }: { children: React.ReactNode }) {
  const [port, setPort] = useState<SerialPortUsed | null>(null);
  const [androidPort, setAndroidPort] = useState<UsbSerialPlugin | null>(null);
  const [enterSends, setEnterSends] = useState<EnterSendsType>("\r\n");

  const toNotifyRef = useRef<SerialOnDataNotify[]>([]);
  const onSentRef = useRef<SerialOnDataNotify[]>([]);

  const platform = Capacitor.getPlatform();
  const onWeb = platform === 'web';
  const onAndroid = platform === 'android';

  useEffect(() => {
    if (onAndroid) return;
    if (!port || !port.readable) return;

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    
    (async () => {
      try {
        let temp = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          for (const c of value) {
            if (c === "\r" || c === "\n") {
              if (temp) {
                // Notify all registered callbacks with the complete line
                toNotifyRef.current.forEach(callback => callback(temp));
                temp = ""; // Reset temp for the next line
              }
            } else {
              temp += c; // Append character to temp
            }
          }
        }
      } catch (error) {
        console.error("Error reading from serial port:", error);
      } finally {
        reader.releaseLock();
      }

      await readableStreamClosed.catch((error) => {
        console.error("Error closing readable stream:", error);
      });
    })();

    return () => {
      reader.releaseLock();
    };
  }, [port]);

  const contextValue: SerialContext = {
    state: onWeb ? (port ? "connected" : "disconnected") : (androidPort ? "connected" : "disconnected"),
    openConnection: async (baud, flowControl, parity, dataBits, stopBits, enterSends) => {
      setEnterSends(enterSends);
      // If we are in web environment, we use the Web Serial API
      if (onWeb) {
        try {
          const serial: SerialUsed | undefined = navigator.serial;
          // const serial : SerialUsed | undefined = serialPolyfill;
          if (!serial) {
            throw new Error("Web Serial API is not supported in this browser.");
          }
          const port = await serial.requestPort();
          await port.open({
            baudRate: baud,
            flowControl: flowControl,
            parity: parity,
            dataBits: dataBits,
            stopBits: stopBits,
          });
          setPort(port);
        } catch (error) {
          console.error("Failed to connect to serial port:", error);
          throw error;
        }
      } else if (onAndroid) {
        const serial = UsbSerial;
        serial.connectedDevices()
          .then(async (devices) => {
            if (!devices.devices || devices.devices.length === 0) {
              throw new Error("No USB serial devices found.");
            }
            const device = (devices.devices as UsbSerialForAndroidFullType[])[0]; // For simplicity, use the first device

            await UsbSerial.openSerial({
              deviceId: device.device.deviceId,
              portNum: device.port,
              baudRate: baud,
              dataBits: dataBits,
              stopBits: stopBits,
            });

            UsbSerial.addListener("data", (data: { data: string }) => {
              let temp = "";
              for (const c of data.data) {
                if (c === "\r" || c === "\n") {
                  if (temp) {
                    // Notify all registered callbacks with the complete line
                    toNotifyRef.current.forEach(callback => callback(temp));
                    temp = ""; // Reset temp for the next line
                  }
                } else {
                  temp += c; // Append character to temp
                }
              }
            });
            setAndroidPort(UsbSerial);
          });
      } else if (platform === 'ios') {
        throw new Error("Serial connection is not supported on iOS.");
      }
    },
    closeConnection: async () => {
      if (port) {
        await port.close();
        setPort(null);
      } else if (androidPort) {
        await androidPort.closeSerial();
        setAndroidPort(null);
      }
    },
    sendData: async (data: string) => {
      if (onWeb) {
        if (!port || !port.writable) {
          throw new Error("Serial port is not open.");
        }
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data + enterSends);
        const writer = port.writable.getWriter();
        try {
          // console.log("Sending data:", data);
          await writer.write(encodedData);
          // console.log("Data sent:", data);
          onSentRef.current.forEach(callback => callback(data));
        } catch (error) {
          console.error("Error sending data:", error);
          throw error;
        } finally {
          writer.releaseLock();
        }
      } else if (onAndroid) {
        if (!androidPort) {
          throw new Error("Serial port is not open.");
        }
        try {
          await androidPort.writeSerial({
            data: data + enterSends,
          })
          onSentRef.current.forEach(callback => callback(data));
        } catch (error) {
          console.error("Error sending data:", error);
          throw error;
        }
      }
    },
    onDataReceived: (callback: SerialOnDataNotify) => {
      if (!port && !androidPort) {
        throw new Error("Serial port is not open.");
      }
      toNotifyRef.current.push(callback);
    },
    releaseOnDataReceived: (callback: SerialOnDataNotify) => {
      toNotifyRef.current = toNotifyRef.current.filter(cb => cb !== callback);
    },
    sendAndWait: async (data: string, timeout: number=1000): Promise<string> => {
      return new Promise((resolve, reject) => {
        let resolved = false;
        // Resolve once we receive "OK"
        let tempData = "";
        const onrecv: SerialOnDataNotify = (receivedData) => {
          tempData += receivedData;
          if (tempData.trim().endsWith("OK")) {
            contextValue.releaseOnDataReceived(onrecv);
            resolved = true;
            resolve(tempData);
          }
        };
        contextValue.onDataReceived(onrecv);
        contextValue.sendData(data)
          .catch((error) => {
            contextValue.releaseOnDataReceived(onrecv);
            resolved = true;
            reject(error);
          });

        setTimeout(() => {
          if (resolved) return;
          contextValue.releaseOnDataReceived(onrecv);
          reject(new Error("Timeout waiting for response"));
        }, timeout);
      });
    },
    onDataSent: (callback: SerialOnDataNotify) => {
      if (!port && !androidPort) {
        throw new Error("Serial port is not open.");
      }
      onSentRef.current.push(callback);
    },
    releaseDataSent: (callback: SerialOnDataNotify) => {
      onSentRef.current = onSentRef.current.filter(cb => cb !== callback);
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = createContext<SerialContext | null>(null);

export function useSerial() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSerial not used in SerialProvider");
  }
  return context;
}

export default useSerial;