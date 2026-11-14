import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-950/90 border-b border-amber-700/50 px-3 py-1 flex items-center justify-center gap-1.5 text-[10px] font-medium text-amber-200 shrink-0">
      <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
      <span>Offline Mode — Peano proof engine running locally</span>
    </div>
  );
};
