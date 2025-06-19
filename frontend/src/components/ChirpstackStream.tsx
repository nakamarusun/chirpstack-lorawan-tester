import { useEffect, useRef, useState } from 'react'
import config from '../config';
import { EventSource } from 'eventsource';
import useAuth from '../hooks/useAuth';

export default function ChirpstackStream() {
  const [messages, setMessages] = useState<string[]>([]);
  const auth = useAuth();

  const chirpstackLogsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (chirpstackLogsRef.current) {
      chirpstackLogsRef.current.scrollTo(0, chirpstackLogsRef.current.scrollHeight);
    }
  }, [messages]);

  // Use SSE to connect to Chirpstack logs
  useEffect(() => {
    const sse = new EventSource(
      `${config.baseUrl}/events/packets`,
      {
        fetch: (input, init) => (
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: `Bearer ${auth.token}`,
            },
          })

        ),
      }
    );
    sse.addEventListener("message", (event) => {
      setMessages((prev) => [...prev, event.data]);
      // Here you can handle the data, e.g., update state or log it
    });

    return () => {
      sse.close();
    }
  }, []);
  return (
    <pre ref={chirpstackLogsRef} className="h-full overflow-y-auto px-2 whitespace-pre-wrap break-all">
      {messages.join("\n")}
    </pre>
  )
}
