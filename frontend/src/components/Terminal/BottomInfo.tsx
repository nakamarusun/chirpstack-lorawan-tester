import { useEffect, useState } from "react";
import gwPic from '../../assets/station-minimalistic-svgrepo-com.svg';
import useLoRaWAN from "../../hooks/useLoRaWAN";
import useChirpstackStream from "../../hooks/useChirpstackStream";
import type { ChirpstackAppUplinkEvent } from "../../models/chirpstack";
import { useGeolocated } from "react-geolocated";

interface LinkParam {
  gwId?: string;
  rssi: number;
  snr: number;
}

export default function BottomInfo() {
  const [gatewaySeen, setGatewaySeen] = useState(0);
  const [lastTx, setLastTx] = useState(new Date(0));
  const [lastGPS, setLastGPS] = useState({
    lat: -1,
    lon: -1,
    alt: -1,
  });
  const [lastUplink, setLastUplink] = useState<LinkParam[]>([]);

  const {
    devAddr,
    nwkSKey,
    appSKey,
    sendCounter,
    signal,
  } = useLoRaWAN();

  const chirpstackStream = useChirpstackStream();
  const geolocated = useGeolocated();

  useEffect(() => {
    setGatewaySeen(0);
    setLastTx(new Date());
    if (geolocated.isGeolocationAvailable && geolocated.isGeolocationEnabled && geolocated.coords) {
      setLastGPS({
        lat: geolocated.coords.latitude,
        lon: geolocated.coords.longitude,
        alt: geolocated.coords.altitude || 0,
      });
    }
    setLastUplink([]);
  }, [sendCounter]);

  useEffect(() => {
    function handleEvent(event: ChirpstackAppUplinkEvent) {
      setGatewaySeen((prev) => prev + 1);
      event.rxInfo.forEach((rx) => {
        setLastUplink((prev) => [...prev, {
          gwId: rx.gatewayId,
          rssi: rx.rssi,
          snr: rx.snr,
        }]);
      });
    }

    chirpstackStream.subscribe(handleEvent);

    return () => {
      chirpstackStream.unsubscribe(handleEvent);
    }
  }, [chirpstackStream]);

  return <>
    <div className="bg-blue-600 flex flex-row items-center overflow-x-auto">
      <div className="flex flex-row flex-grow text-left">
        <div className="font-semibold pl-2">
          <p>Last Conn</p>
          <p>{`(${lastGPS.lat}, ${lastGPS.lon}, ${lastGPS.alt}m)`}</p>
          <p>{`${lastTx.getHours()}:${lastTx.getMinutes()}:${lastTx.getSeconds()}.${lastTx.getMilliseconds()}`}</p>
        </div>
        <div className="w-3" />
        <div>
          <p>Downlink</p>
          <p>{`DL RSSI: ${signal.rssi}`}</p>
          <p>{`DL SNR: ${signal.snr}`}</p>
        </div>
        <div className="w-3" />
        {
          lastUplink.map((uplink, index) => (
            <div key={index}>
              <p>{`GWID: ${uplink.gwId}`}</p>
              <p>{`RSSI: ${uplink.rssi}`}</p>
              <p>{`SNR: ${uplink.snr}`}</p>
            </div>
          ))
        }
      </div>
      <div className="flex flex-row items-center gap-1 md:gap-2 bg-fuchsia-600 h-full">
        <img src={gwPic} alt="Station Minimalistic Logo" className="w-8 h-8 md:w-10 md:h-10 p-1" />
        <p className="text-xl md:text-3xl font-bold mr-2">{gatewaySeen}</p>
      </div>
    </div>
    <div className="bg-green-500 text-black py-0.5 flex flex-wrap flex-row items-start justify-between px-2">
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
  </>
}
