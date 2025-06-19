import { createContext, useContext, useEffect, useRef, useState } from "react";

export type DataBitsType = 7 | 8;
export type StopBitsType = 1 | 2;
export type EnterSendsType = "" | "\r" | "\n" | "\r\n";
export type SerialConnectionType = "connected" | "disconnected";

export type SerialOnDataNotify = (data: string) => void

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
  const [port, setPort] = useState<SerialPort | null>(null);
  const [enterSends, setEnterSends] = useState<EnterSendsType>("\r\n");

  const toNotifyRef = useRef<SerialOnDataNotify[]>([]);
  const onSentRef = useRef<SerialOnDataNotify[]>([]);

  useEffect(() => {
    if (!port) return;

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
    state: port ? "connected" : "disconnected",
    openConnection: async (baud, flowControl, parity, dataBits, stopBits, enterSends) => {
      try {
        const serial: Serial | undefined = navigator.serial;
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
        setEnterSends(enterSends);
        setPort(port);
      } catch (error) {
        console.error("Failed to connect to serial port:", error);
        throw error;
      }
    },
    closeConnection: async () => {
      if (port) {
        await port.close();
        setPort(null);
      }
    },
    sendData: async (data: string) => {
      if (!port) {
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
    },
    onDataReceived: (callback: SerialOnDataNotify) => {
      if (!port) {
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
        const onrecv: SerialOnDataNotify = (receivedData) => {
          contextValue.releaseOnDataReceived(onrecv);
          resolved = true;
          resolve(receivedData);
        };
        contextValue.onDataReceived(onrecv);
        contextValue.sendData(data)
          .catch((error) => {
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
      if (!port) {
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