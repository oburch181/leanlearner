import React from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Lightbulb, 
  Smartphone,
  Info,
  Sparkles,
  Settings
} from 'lucide-react';
import { isStandaloneOrNative } from '../utils/nativeAndroid';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onOpenBriefing?: () => void;
  onOpenCodex?: () => void;
  onOpenHints?: () => void;
  onOpenAndroidInstall: () => void;
  onOpenFreeplay?: () => void;
  onOpenSettings?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unlockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  onOpenBriefing,
  onOpenCodex,
  onOpenHints,
  onOpenAndroidInstall,
  onOpenFreeplay,
  soundEnabled,
  onToggleSound,
  unlockedCount,
  onOpenSettings,
}) => {
  return (
    <header className="h-14 w-full bg-[#E3D4B3]/95 backdrop-blur-md border-b border-[#CEBA92] px-3 flex items-center justify-between gap-2 z-30 shrink-0 select-none">
      {/* Left: Back or Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack ? (
          <button
            onClick={onBack}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#2C2115] hover:bg-[#D5C39C] transition active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#9A5B13] flex items-center justify-center font-serif font-black text-[#FDF8EC] text-base shrink-0 shadow-xs">
            ℕ
          </div>
        )}

        <div className="truncate">
          <h1 className="text-sm font-extrabold text-[#2C2115] truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[#5C4A36] truncate leading-tight font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onOpenBriefing && (
          <button
            onClick={onOpenBriefing}
            className="min-w-[38px] min-h-[38px] rounded-xl text-[#8B4F0E] hover:bg-[#D5C39C] transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="View Story & Briefing"
          >
            <Info className="w-5 h-5" />
          </button>
        )}

        {onOpenHints && (
          <button
            onClick={onOpenHints}
            className="min-w-[38px] min-h-[38px] rounded-xl text-[#9A5B13] hover:bg-[#D5C39C] transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="Get Hints"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        )}

        {onOpenCodex && (
          <button
            onClick={onOpenCodex}
            className="relative min-w-[38px] min-h-[38px] rounded-xl text-[#8B4F0E] hover:bg-[#D5C39C] transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="Open Theorem Codex"
          >
            <BookOpen className="w-5 h-5" />
            {unlockedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#9A5B13] text-[#FDF8EC] text-[10px] font-bold flex items-center justify-center font-mono">
                {unlockedCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onToggleSound}
          className="min-w-[38px] min-h-[38px] rounded-xl text-[#5C4A36] hover:text-[#2C2115] hover:bg-[#D5C39C] transition active:scale-95 flex items-center justify-center cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#7D6952]" />}
        </button>

        {/* Freeplay Sandbox Button */}
        {onOpenFreeplay && (
          <button
            onClick={onOpenFreeplay}
            className="px-2.5 min-h-[36px] rounded-xl bg-[#EFE5CC] border border-[#C5AE8A] text-[#6B4C35] hover:bg-[#E6DAC0] text-xs font-bold flex items-center gap-1 transition active:scale-95 ml-0.5 cursor-pointer"
            title="Open Freeplay Sandbox"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B4F0E]" />
            <span>Freeplay</span>
          </button>
        )}

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="min-w-[38px] min-h-[38px] rounded-xl text-[#5C4A36] hover:text-[#2C2115] hover:bg-[#D5C39C] transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="Game Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* Android Install Button (hidden inside native APK / standalone PWA) */}
        {!isStandaloneOrNative() && (
          <button
            onClick={onOpenAndroidInstall}
            className="px-2.5 min-h-[36px] rounded-xl bg-[#EAE0CB] border border-[#C5AE8A] text-[#4A3B2C] hover:bg-[#DFD2B5] text-xs font-bold flex items-center gap-1 transition active:scale-95 ml-0.5 cursor-pointer"
            title="Install Android App or Export APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#5F5343]" />
            <span>App</span>
          </button>
        )}
      </div>
    </header>
  );
};
