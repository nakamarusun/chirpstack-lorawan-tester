import { useEffect, useRef, useState } from 'react'
import SerialConnection from './SerialConnection';
import useSerial from '../hooks/useSerial';
import clsx from 'clsx';
import gwPic from '../assets/station-minimalistic-svgrepo-com.svg';
import ChirpstackStream from './ChirpstackStream';
import useLoRaWAN from '../hooks/useLoRaWAN';

export default function Terminal() {
  const [canUseSerial] = useState(() => "serial" in navigator);
  const serial = useSerial();
  const {
    devAddr,
    nwkSKey,
    appSKey,
  } = useLoRaWAN();

  const [termLog, setTermLog] = useState<string[]>([]);

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
            <pre ref={serialLogsRef} className="overflow-y-auto px-2 whitespace-pre-wrap">
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
        <div className="bg-blue-600 flex flex-row items-center">
          <div className="flex flex-row flex-grow text-left">
            <div className="font-semibold pl-2">
              <p>Last Conn</p>
              <p>-6.32, 553.2</p>
              <p>05:12:22</p>
            </div>
            <div className="w-3" />
            <div>
              <p>Downlink</p>
              <p>DL RSSI: 55</p>
              <p>DL SNR: 55</p>
            </div>
            <div className="w-3" />
            <div>
              <p>gw-05321233</p>
              <p>RSSI: 55</p>
              <p>SNR: 55</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 bg-fuchsia-600 h-full">
            <img src={gwPic} alt="Station Minimalistic Logo" className="w-10 h-10 p-1" />
            <p className="text-3xl font-bold mr-2">0</p>
          </div>
        </div>
        <div className="bg-green-500 text-black py-0.5 md:pb-3 flex flex-col md:flex-row items-start md:items-center md:justify-between px-2">
          <div>
            <span className="mr-2">DevAddr:</span>
            <span>{devAddr}</span>
          </div>
          <div>
            <span className="mr-2">NwkSKey:</span>
            <span>{nwkSKey}</span>
          </div>
          <div>
            <span className="mr-2">AppSKey:</span>
            <span>{appSKey}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
