import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anamico.india',
  appName: 'ANAMICO India',
  webDir: 'public',
  server: {
    url: 'https://amicocart.com',
    cleartext: true
  }
};

export default config;
