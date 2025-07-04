import { createContext, useContext, useEffect, useRef } from 'react'
import type { ChirpstackAppUplinkEvent } from '../models/chirpstack';
import config from '../config';
import useAuth from './useAuth';
// import { EventSource } from 'eventsource';
import ReconnectingEventSource from 'reconnecting-eventsource';

export type ChirpstackUplinkSubscriber = (message: ChirpstackAppUplinkEvent) => void

interface ChirpstackStreamContext {
  subscribe: (callback: ChirpstackUplinkSubscriber) => void;
  unsubscribe: (callback: ChirpstackUplinkSubscriber) => void;
}

export function ChirpstackStreamProvider({children}: {children: React.ReactNode}) {
  const subsbcribersRef = useRef<ChirpstackUplinkSubscriber[]>([]);
  const auth = useAuth();

  // Use SSE to connect to Chirpstack logs
  useEffect(() => {
    if (!auth.token) return;
    const sse = new ReconnectingEventSource(
      `${config.baseUrl}/events/packets?token=${auth.token}`,
    );

    sse.onerror = (event) => {
      console.log(`BRUH5 SSE connection error: ${JSON.stringify(event)} ${event}`);
    };

    sse.addEventListener("message", (event) => {
      const data: ChirpstackAppUplinkEvent = JSON.parse(event.data);
      subsbcribersRef.current.forEach((callback) => callback(data));
    });

    // Add this for error handling:
    sse.addEventListener("error", (event) => {
      console.log(`BRUH4 SSE connection error: ${JSON.stringify(event)} ${event}`);
    });

    return () => {
      sse.close();
    }
  }, [auth.token]);

  const hook: ChirpstackStreamContext = {
    subscribe: (callback) => {
      subsbcribersRef.current.push(callback);
    },
    unsubscribe: (callback) => {
      subsbcribersRef.current = subsbcribersRef.current.filter((sub) => sub !== callback);
    }
  }
  return (
    <ChirpstackStreamContext.Provider value={hook}>
      {children}
    </ChirpstackStreamContext.Provider>
  )
}

export const ChirpstackStreamContext = createContext<ChirpstackStreamContext | null>(null);

export function useChirpstackStream() {
  const context = useContext(ChirpstackStreamContext);
  if (!context) {
    throw new Error("useChirpstackStream must be used within a ChirpstackStreamProvider");
  }
  return context;
}

export default useChirpstackStream;