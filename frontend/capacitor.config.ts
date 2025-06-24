import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jasoncoding.chirploratest',
  appName: 'Chirpstack LoRaWAN Tester',
  webDir: 'dist',
  plugins: {
    "CapacitorHttp": {
      "enabled": true,
    },
  }
};

export default config;
