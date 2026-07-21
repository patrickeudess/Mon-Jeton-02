import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ci.monjeton.app',
  appName: 'Mon Jeton',
  webDir: 'www',
  bundledWebRuntime: false,
  android: { allowMixedContent: false }
};

export default config;
