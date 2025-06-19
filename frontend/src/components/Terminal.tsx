import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import useSerial from '../hooks/useSerial';
import ChirpstackStream from './ChirpstackStream';
import SerialConnection from './SerialConnection';
import BottomInfo from './Terminal/BottomInfo';

export default function Terminal() {
  const [canUseSerial] = useState(() => "serial" in navigator);
  const [termLog, setTermLog] = useState<string[]>([]);

  const serial = useSerial();
  const serialLogsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (serialLogsRef.current) {
      serialLogsRef.current.scrollTop = serialLogsRef.current.scrollHeight;
    }
  }, [termLog]);

  // Do some preliminary data collection
  useEffect(() => {
    if (serial.state !== "connected") return;

    function addToLog(data: string, addStr: string="") {
      const timestamp = (new Date()).toISOString().replace("T", " ").replace("Z", "");
      data = `[${timestamp}]${addStr}${data}`;
      setTermLog((prev) => [...prev, data]);      
    }

    // Register some uhhh callbacks cuh
    serial.onDataReceived((data) => {
      addToLog(data);
    });
    serial.onDataSent((data) => {
      addToLog(data, ">");
    });
  }, [serial.state]);


  if (!canUseSerial) {
    return (
      <div className="text-red-500 font-source-code-pro text-lg font-bold">
        Browser tidak mendukung Web Serial API. Silahkan gunakan browser yang mendukung seperti Google Chrome atau Microsoft Edge.
      </div>
    );
  }

  return (
    <div className="font-source-code-pro text-xs md:text-sm flex flex-col text-white h-full w-full font-normal relative">
      {/* Main screen */}
      <div className={clsx("flex-grow flex flex-col text-left overflow-auto", {
        "justify-center items-center": serial.state === "disconnected",
      })}>
      {serial.state === "connected" ? (
        <div className="flex flex-col h-full overflow-auto">
          <div className="flex flex-col flex-grow h-full overflow-auto">
            <p className="font-semibold bg-cyan-600 px-2">
              Serial Term
            </p>
            <pre ref={serialLogsRef} className="overflow-y-auto px-2 whitespace-pre-wrap break-all">
              {termLog.join("\n")}
            </pre>
          </div>
          <div className="flex flex-col flex-grow h-full overflow-auto">
            <p className="font-semibold bg-cyan-600 px-2">
              Chirpstack Logs
            </p>
              <ChirpstackStream />
          </div>
        </div>
      ) : (
        <SerialConnection />
      )}
      </div>

      {/* Bottom long text */}
      <div className="flex flex-col">
        <BottomInfo />
      </div>
    </div>
  )
}
