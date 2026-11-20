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
    <div className="bg-[#EFE0BA] border-b border-[#C9A96E] px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-[#6E3F0A] shrink-0">
      <WifiOff className="w-3.5 h-3.5 text-[#8B4F0E] shrink-0" />
      <span>Offline Mode — Peano proof engine running locally</span>
    </div>
  );
};
