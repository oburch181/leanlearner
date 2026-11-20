import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.leanprover.nng4',
  appName: 'NNG4 Lean',
  webDir: 'dist',
  backgroundColor: '#EDE2C6',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#EDE2C6',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'native',
      style: 'LIGHT',
      hidden: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#E3D4B3',
      overlaysWebView: false,
    },
  },
};

export default config;
