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
    <div className="bg-[#E0F2FE] border-b border-[#7DD3FC] px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-[#075985] shrink-0">
      <WifiOff className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
      <span>Offline Mode — Peano proof engine running locally</span>
    </div>
  );
};
