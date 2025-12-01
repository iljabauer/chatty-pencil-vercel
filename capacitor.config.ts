import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.humanintent.ios.chattypencil',
  appName: 'Chatty Pencil',
  webDir: 'out',
	server: {
		url: 'http://192.168.100.129:3000',
		cleartext: true
	}
};

export default config;
