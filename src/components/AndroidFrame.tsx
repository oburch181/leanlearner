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
      <div className="relative w-full h-dvh bg-[#F4F8FC] text-[#0C1B2E] flex flex-col overflow-hidden">
        <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>
      </div>
    );
  }

  if (!frameMode) {
    return (
      <div className="relative w-full h-dvh bg-[#F4F8FC] text-[#0C1B2E] flex flex-col overflow-hidden">
        {/* Minimal Android System Bar on full screen */}
        <div className="h-7 w-full bg-[#E6F0FA] px-4 flex items-center justify-between text-xs font-medium text-[#36506B] select-none z-40 border-b border-[#C5D8EC]">
          <span className="font-semibold text-[#0C1B2E] tracking-wider font-mono">{time || '12:00'}</span>
          <div className="flex items-center gap-2.5">
            <Signal className="w-3.5 h-3.5 text-[#36506B]" />
            <Wifi className="w-3.5 h-3.5 text-[#36506B]" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono">98%</span>
              <BatteryMedium className="w-4 h-4 text-[#475569]" />
            </div>
            <button
              onClick={onToggleFrameMode}
              title="Show in Android Phone mockup"
              className="ml-1 px-2 py-0.5 rounded-md bg-[#DCE9F7] border border-[#A8C4E0] text-xs font-semibold text-[#0C1B2E] hover:bg-[#C2D7EE] flex items-center gap-1 cursor-pointer transition"
            >
              <Smartphone className="w-3 h-3" />
              <span>Frame</span>
            </button>
          </div>
        </div>

        <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>

        {/* Android Gesture Bar */}
        <div className="h-4 w-full bg-[#F4F8FC] flex items-center justify-center pointer-events-none select-none z-30">
          <div className="w-28 h-1 rounded-full bg-[#A8C4E0]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#E2ECF6] flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Frame Controls Bar for Desktop */}
      <div className="mb-2.5 hidden sm:flex items-center justify-between w-full max-w-[430px] px-2 text-xs text-[#36506B]">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-[#0369A1]" />
          <span className="font-semibold text-[#0C1B2E]">Android Mobile Preview · Pixel 9 Pro</span>
        </div>
        <button
          onClick={onToggleFrameMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] text-[#0C1B2E] hover:bg-[#E6F0FA] transition text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Android Device Shell */}
      <div className="relative w-full max-w-[430px] h-[870px] max-h-[95dvh] bg-[#1E293B] rounded-[44px] p-3 shadow-2xl shadow-[#0C1B2E]/25 border-4 border-[#334155] flex flex-col">
        {/* Device Outer Buttons */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-[#475569] rounded-l-sm" />
        <div className="absolute -left-[7px] top-42 w-[3px] h-14 bg-[#475569] rounded-l-sm" />
        <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-[#475569] rounded-r-sm" />

        {/* Screen Bezel */}
        <div className="relative w-full h-full bg-[#F4F8FC] rounded-[34px] overflow-hidden flex flex-col border border-[#A8C4E0]">
          {/* Android Status Bar */}
          <div className="h-8 w-full bg-[#E6F0FA] px-5 flex items-center justify-between text-xs font-medium text-[#36506B] select-none z-50 border-b border-[#D6E5F4]">
            <span className="font-semibold text-[#0C1B2E] tracking-wider font-mono">{time || '12:00'}</span>

            {/* Camera Punch-hole */}
            <div className="w-4 h-4 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>

            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3 text-[#36506B]" />
              <Wifi className="w-3.5 h-3.5 text-[#36506B]" />
              <div className="flex items-center gap-0.5">
                <span className="text-xs font-mono">98%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-[#475569]" />
              </div>
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 w-full relative overflow-hidden flex flex-col">{children}</div>

          {/* Android Bottom Navigation Gesture Bar */}
          <div className="h-5 w-full bg-[#F4F8FC] flex items-center justify-center pointer-events-none select-none z-40">
            <div className="w-32 h-1 rounded-full bg-[#A8C4E0]" />
          </div>
        </div>
      </div>
    </div>
  );
};
