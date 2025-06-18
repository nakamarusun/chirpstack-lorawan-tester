import { createContext, useContext, useEffect, useState } from "react";

export type DataBitsType = 7 | 8;
export type StopBitsType = 1 | 2;
export type EnterSendsType = "" | "\r" | "\n" | "\r\n";
export type SerialConnectionType = "connected" | "disconnected";

export type SerialOnDataNotify = (data: string) => void

interface SerialContext {
  sendData(data: string): Promise<void>;
  onDataReceived(callback: SerialOnDataNotify): void;
  releaseOnDataReceived(callback: SerialOnDataNotify): void;
  closeConnection(): Promise<void>;
  openConnection(
    baud: number,
    flowControl: FlowControlType,
    parity: ParityType,
    dataBits: DataBitsType,
    stopBits: StopBitsType,
    enterSends: EnterSendsType
  ): Promise<void>;
  status: SerialConnectionType;
}

export function SerialProvider({ children }: { children: React.ReactNode }) {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [enterSends, setEnterSends] = useState<EnterSendsType>("\r\n");
  const [toNotify, setToNotify] = useState<SerialOnDataNotify[]>([]);

  useEffect(() => {
    if (!port) return;

    const reader = port.readable.getReader();
    const decoder = new TextDecoder();

    async function readLoop() {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          toNotify.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error("Error reading from serial port:", error);
      } finally {
        reader.releaseLock();
      }
    }

    readLoop();

    return () => {
      reader.cancel();
    };
  }, [port]);

  const contextValue: SerialContext = {
    status: port ? "connected" : "disconnected",
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
        await writer.write(encodedData);
      } finally {
        writer.releaseLock();
      }
    },
    onDataReceived: (callback: SerialOnDataNotify) => {
      if (!port) {
        throw new Error("Serial port is not open.");
      }
      setToNotify((prev) => [...prev, callback]);
    },
    releaseOnDataReceived: (callback: SerialOnDataNotify) => {
      setToNotify((prev) => prev.filter(cb => cb !== callback));
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