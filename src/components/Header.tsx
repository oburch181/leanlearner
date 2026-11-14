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
    <header className="h-12 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 flex items-center justify-between z-30 shrink-0">
      {/* Left: Back or Brand */}
      <div className="flex items-center gap-2 min-w-0">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition active:scale-95 shrink-0"
            title="Return to World Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center font-serif font-black text-white text-xs shrink-0">
            ℕ
          </div>
        )}

        <div className="truncate">
          <h1 className="text-xs font-bold text-white truncate">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onOpenBriefing && (
          <button
            onClick={onOpenBriefing}
            className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-950/40 transition active:scale-95"
            title="View Story & Briefing"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {onOpenHints && (
          <button
            onClick={onOpenHints}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 transition active:scale-95"
            title="Get Hints"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        )}

        {onOpenCodex && (
          <button
            onClick={onOpenCodex}
            className="relative p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-950/40 transition active:scale-95"
            title="Open Theorem Codex"
          >
            <BookOpen className="w-4 h-4" />
            {unlockedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 text-white text-[8px] font-bold flex items-center justify-center font-mono">
                {unlockedCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition active:scale-95"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Freeplay Sandbox Button */}
        {onOpenFreeplay && (
          <button
            onClick={onOpenFreeplay}
            className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-[10px] font-semibold flex items-center gap-1 transition active:scale-95 ml-0.5"
            title="Open Freeplay Sandbox"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Freeplay</span>
          </button>
        )}

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition active:scale-95"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Android Install Button (hidden inside native APK / standalone PWA) */}
        {!isStandaloneOrNative() && (
          <button
            onClick={onOpenAndroidInstall}
            className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 text-[10px] font-semibold flex items-center gap-1 transition active:scale-95 ml-0.5"
            title="Install Android App or Export APK"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Android</span>
          </button>
        )}
      </div>
    </header>
  );
};
