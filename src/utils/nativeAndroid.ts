import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export function isStandaloneOrNative(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    isNativeAndroid() ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export async function configureNativeAndroidUI(): Promise<void> {
  if (!isNativeAndroid()) return;
  try {
    await SystemBars.show();
    await SystemBars.setStyle({ style: SystemBarsStyle.Light });
  } catch {
    // Ignore SystemBars errors if unavailable
  }
  try {
    await StatusBar.show();
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#E3D4B3' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Ignore status bar plugin errors in non-native environments
  }
}

export function registerAndroidBackHandler(
  onBackPress: () => boolean
): () => void {
  if (!isNativeAndroid()) return () => {};

  let handle: { remove: () => Promise<void> } | null = null;
  let cancelled = false;

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    const handled = onBackPress();
    if (!handled) {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    }
  }).then((listener) => {
    if (cancelled) {
      listener.remove().catch(() => {});
    } else {
      handle = listener;
    }
  }).catch(() => {});

  return () => {
    cancelled = true;
    handle?.remove().catch(() => {});
  };
}
