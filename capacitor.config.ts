import type { CapacitorConfig } from '@capacitor/cli';

const isDev = true; //process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'ai.humanintent.ios.chattypencil',
  appName: 'Chatty Pencil',
  webDir: 'out',
  // Only use server.url in development for hot reload
  // In production, static files are bundled in the app
  ...(isDev && {
    server: {
      url: 'http://192.168.100.129:3000',
      cleartext: true
    }
  })
};

export default config;
