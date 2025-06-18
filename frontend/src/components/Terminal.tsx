import React, { useState } from 'react'
import SerialConnection from './SerialConnection';

export default function Terminal() {
  const [canUseSerial] = useState(() => "serial" in navigator);

  // const [devEui, setDevEui] = useState("");
  const [devAddr, setDevAddr] = useState("00000000");
  const [nwkSKey, setNwkSKey] = useState("00000000000000000000000000000000");
  const [appSKey, setAppSKey] = useState("00000000000000000000000000000000");


  if (!canUseSerial) {
    return (
      <div className="text-red-500 font-source-code-pro text-lg font-bold">
        Browser tidak mendukung Web Serial API. Silahkan gunakan browser yang mendukung seperti Google Chrome atau Microsoft Edge.
      </div>
    );
  }

  return (
    <div className="font-source-code-pro text-xs md:text-base flex flex-col text-white h-full w-full font-normal relative">
      {/* Main screen */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <SerialConnection />
      </div>

      {/* Bottom long text */}
      <div className="bg-gray-400 text-black py-0.5 flex flex-col md:flex-row items-start md:items-center md:justify-between">
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
