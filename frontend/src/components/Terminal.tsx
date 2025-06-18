import { useEffect, useState } from 'react'
import SerialConnection from './SerialConnection';
import useSerial from '../hooks/useSerial';
import clsx from 'clsx';

function trimValueFromAt(value: string): string {
  return value.split("\n")[0].trim();
}

export default function Terminal() {
  const [canUseSerial] = useState(() => "serial" in navigator);
  const serial = useSerial();

  // const [devEui, setDevEui] = useState("");
  const [devAddr, setDevAddr] = useState("00000000");
  const [nwkSKey, setNwkSKey] = useState("00000000000000000000000000000000");
  const [appSKey, setAppSKey] = useState("00000000000000000000000000000000");

  const [termLog, setTermLog] = useState<string[]>([]);

  // Do some preliminary data collection
  useEffect(() => {
    if (serial.state === "disconnected") return;

    (async () => {
      setDevAddr(trimValueFromAt(await serial.sendAndWait("AT+DEVADDR=?", 1000)));
      setNwkSKey(trimValueFromAt(await serial.sendAndWait("AT+NWKSKEY=?", 1000)));
      setAppSKey(trimValueFromAt(await serial.sendAndWait("AT+APPSKEY=?", 1000)));
    })();

    // Register some uhhh callbacks cuh
    serial.onDataReceived((data) => {
      // Timestamp the data
      const timestamp = (new Date()).toISOString().replace("T", " ").replace("Z", "");
      data = `[${timestamp}]${data}`;
      setTermLog((prev) => [...prev, data]);
    });
    serial.onDataSent((data) => {
      // Timestamp the data
      const timestamp = (new Date()).toISOString().replace("T", " ").replace("Z", "");
      data = `[${timestamp}]>${data}`;
      setTermLog((prev) => [...prev, data]);
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
      <div className={clsx("flex-grow flex flex-col text-left", {
        "justify-center items-center": serial.state === "disconnected",
      })}>
      {serial.state === "connected" ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-col flex-grow">
            <p className="font-semibold bg-cyan-600 px-2">
              Serial Term
            </p>
            <pre className="overflow-y-auto px-2">
              {termLog.join("\n")}
            </pre>
          </div>
          <div className="flex flex-col flex-grow">
            <p className="font-semibold bg-cyan-600 px-2">
              Gateways RAW
            </p>
            <pre className="overflow-y-auto px-2">
              {termLog.join("\n")}
            </pre>
          </div>
        </div>
      ) : (
        <SerialConnection />
      )}
      </div>

      {/* Bottom long text */}
      <div className="bg-gray-400 text-black py-0.5 pb-3 flex flex-col md:flex-row items-start md:items-center md:justify-between px-2">
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
  )
}
