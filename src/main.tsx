import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { isNativeAndroid } from './utils/nativeAndroid';

if (typeof window !== 'undefined' && !isNativeAndroid()) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(<App />);
