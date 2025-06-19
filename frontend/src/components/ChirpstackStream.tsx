import { useEffect, useRef, useState } from 'react'
import type { ChirpstackAppUplinkEvent } from '../models/chirpstack';
import useChirpstackStream from '../hooks/useChirpstackStream';

function uplinkEventToString(event: ChirpstackAppUplinkEvent): string {
  return event.rxInfo.reduce((cur, rx) => {
    return cur + `[${new Date(event.time).toISOString()} ${event.confirmed ? "CFM" : "UCFM"}] GWID: ${rx.gatewayId} (RSSI ${rx.rssi}, SNR ${rx.snr}) freq: ${event.txInfo.frequency/1000000} DR:${event.txInfo.modulation.lora.spreadingFactor} fcnt: ${event.fCnt} devaddr: ${event.devAddr} data_len: ${atob(event.data).length}\n`;
  }, "")
}

export default function ChirpstackStream() {
  const [messages, setMessages] = useState<string[]>([]);
  const chirpstackStream = useChirpstackStream();

  const chirpstackLogsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (chirpstackLogsRef.current) {
      chirpstackLogsRef.current.scrollTo(0, chirpstackLogsRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    const subscriber = (event: ChirpstackAppUplinkEvent) => {
      setMessages((prev) => [...prev, uplinkEventToString(event)]);
    }

    chirpstackStream.subscribe(subscriber);

    return () => {
      chirpstackStream.unsubscribe(subscriber);
    }
  }, [chirpstackStream]);

  return (
    <pre ref={chirpstackLogsRef} className="h-full overflow-y-auto px-2 whitespace-pre-wrap break-all">
      {messages.join("")}
    </pre>
  )
}
