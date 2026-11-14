import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  frameMode: boolean;
  onToggleFrameMode: () => void;
  accentColor?: string;
  isNativeOrStandalone?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  frameMode,
  onToggleFrameMode,
  isNativeOrStandalone = false,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isNativeOrStandalone) {
    return (
      <div className="relative w-full h-dvh bg-slate-950 flex flex-col overflow-hidden">
        <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>
      </div>
    );
  }

  if (!frameMode) {
    return (
      <div className="relative w-full h-dvh bg-slate-950 flex flex-col overflow-hidden">
        {/* Minimal Android System Bar on full screen */}
        <div className="h-6 w-full bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none z-40 border-b border-slate-900/60">
          <span className="font-semibold text-slate-300 tracking-wider font-mono">{time || '12:00'}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3 h-3 text-slate-400" />
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
            <button
              onClick={onToggleFrameMode}
              title="Show in Android Phone mockup"
              className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-2.5 h-2.5" />
              <span>Frame</span>
            </button>
          </div>
        </div>

        <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>

        {/* Android Gesture Bar */}
        <div className="h-4 w-full bg-slate-950 flex items-center justify-center pointer-events-none select-none z-30">
          <div className="w-28 h-1 rounded-full bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
      {/* Frame Controls Bar for Desktop */}
      <div className="mb-2 hidden sm:flex items-center justify-between w-full max-w-[430px] px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-300">Android Mobile Preview (Pixel 9 Pro)</span>
        </div>
        <button
          onClick={onToggleFrameMode}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition text-[11px] cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Android Device Shell */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[96dvh] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-indigo-950/60 border-4 border-slate-800/80 flex flex-col ring-1 ring-white/10">
        {/* Device Outer Buttons */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[7px] top-42 w-[3px] h-14 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Bezel */}
        <div className="relative w-full h-full bg-slate-950 rounded-[34px] overflow-hidden flex flex-col border border-slate-800/50">
          {/* Android Status Bar */}
          <div className="h-8 w-full bg-slate-950 px-5 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none z-50">
            <span className="font-semibold text-slate-200 tracking-wider font-mono">{time || '12:00'}</span>

            {/* Camera Punch-hole */}
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3 text-slate-400" />
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>

          {/* Android Bottom Navigation Gesture Bar */}
          <div className="h-5 w-full bg-slate-950 flex items-center justify-center pointer-events-none select-none z-40">
            <div className="w-32 h-1 rounded-full bg-slate-600/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
