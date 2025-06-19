import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp } from "antd";
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import '@ant-design/v5-patch-for-react-19';
import { SerialProvider } from './hooks/useSerial.tsx';
import { LoRaWANProvider } from './hooks/useLoRaWAN.tsx';
import { ChirpstackStreamProvider } from './hooks/useChirpstackStream.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdApp>
      <AuthProvider>
        <SerialProvider>
          <LoRaWANProvider>
            <ChirpstackStreamProvider>
              <App />
            </ChirpstackStreamProvider>
          </LoRaWANProvider>
        </SerialProvider>
      </AuthProvider>
    </AntdApp>
  </StrictMode>,
)
