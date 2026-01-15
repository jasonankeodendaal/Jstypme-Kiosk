import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jstyp.kiosk',
  appName: 'Kiosk Pro Showcase',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    // Configure native plugins here if needed in the future
  }
};

export default config;