import React, { useState } from 'react';
import { UserProgress } from '../types/lean';
import { 
  ArrowLeft, 
  Unlock, 
  Lock, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Smartphone, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { playKeyClick, playTacticSuccess } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';
import { WORLDS } from '../data/worlds';

interface SettingsViewProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBack: () => void;
  onResetProgress: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  progress,
  onUpdateProgress,
  onBack,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const totalWorlds = WORLDS.length;
  const totalLevels = WORLDS.reduce((acc, w) => acc + w.levels.length, 0);

  const toggleUnlockAllTutorials = () => {
    playKeyClick(progress.soundEnabled);
    onUpdateProgress((prev) => ({
      ...prev,
      unlockAllTutorials: !prev.unlockAllTutorials,
    }));
  };

  const toggleUnlockAllTactics = () => {
    playKeyClick(progress.soundEnabled);
    onUpdateProgress((prev) => ({
      ...prev,
      unlockAllTactics: !prev.unlockAllTactics,
    }));
  };

  const toggleSound = () => {
    playKeyClick(!progress.soundEnabled);
    onUpdateProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const toggleHaptics = () => {
    playKeyClick(progress.soundEnabled);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    onUpdateProgress((prev) => ({
      ...prev,
      hapticsEnabled: !prev.hapticsEnabled,
    }));
  };

  const toggleFrameMode = () => {
    playKeyClick(progress.soundEnabled);
    onUpdateProgress((prev) => ({
      ...prev,
      mobileFrameMode: !prev.mobileFrameMode,
    }));
  };

  const handleExportBackup = async () => {
    playTacticSuccess(progress.soundEnabled, progress.hapticsEnabled);
    const backupJson = JSON.stringify(progress, null, 2);
    const ok = await copyToClipboard(backupJson);
    if (ok) {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
    }
  };

  const handleConfirmReset = () => {
    playKeyClick(progress.soundEnabled);
    onResetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Settings Top Bar */}
      <div className="h-12 w-full bg-slate-950/90 border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-xs font-bold text-white tracking-wide">Settings</h1>

        <div className="w-8" />
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-lg mx-auto w-full">
        {/* Progression & Unlocks Section */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 px-1 flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5" />
            <span>Progression & Game Rules</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-sm overflow-hidden">
            {/* Unlock All Tutorials / Levels */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Unlock All Tutorials & Worlds</span>
                  {progress.unlockAllTutorials ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px]">
                      All Unlocked
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px]">
                      Default: Progressive
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Instantly unlock all {totalWorlds} worlds and {totalLevels} proof levels without having to beat prior levels first.
                </p>
              </div>

              {/* iOS / Android style toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={!!progress.unlockAllTutorials}
                onClick={toggleUnlockAllTutorials}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.unlockAllTutorials ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    progress.unlockAllTutorials ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Unlock All Tactics in Tutorials */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Unlock All Tactics Everywhere</span>
                  {progress.unlockAllTactics ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px]">
                      All Tactics
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px]">
                      Default: Gated
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Enable all tactics (<code className="text-slate-300">rfl</code>, <code className="text-slate-300">rw</code>, <code className="text-slate-300">induction</code>, etc.) on the keyboard from Level 1 instead of unlocking step-by-step.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!!progress.unlockAllTactics}
                onClick={toggleUnlockAllTactics}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.unlockAllTactics ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    progress.unlockAllTactics ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Audio & Tactile Section */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Sound & Haptic Feedback</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-sm overflow-hidden">
            {/* Audio */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {progress.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Mathematical Sound Effects</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Synthesized harmonic chimes for tactic success and level completion fanfare.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={progress.soundEnabled}
                onClick={toggleSound}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    progress.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-sky-400" />
                  <span>Haptic Vibration</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Tactile feedback when tapping Lean tactics, math symbols, and completing proofs.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={progress.hapticsEnabled}
                onClick={toggleHaptics}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.hapticsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    progress.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Display & Viewport</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-xs font-bold text-white">Android Device Frame</span>
              <p className="text-[11px] text-slate-400 font-sans">
                Renders a Google Pixel phone shell on wide desktop screens. Turn off for full-bleed.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={progress.mobileFrameMode}
              onClick={toggleFrameMode}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                progress.mobileFrameMode ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  progress.mobileFrameMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data & Backup Section */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Data & Backup
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <button
              onClick={handleExportBackup}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-between transition active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {copiedBackup ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                <span>{copiedBackup ? 'Progress Copied to Clipboard!' : 'Export Game Save & Custom Theorems'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">JSON</span>
            </button>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 text-xs font-medium flex items-center justify-between transition active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset All Proof Progress</span>
                </div>
                <span className="text-[10px] text-rose-400">Clear</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Are you sure? This will reset all completed levels.</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
                  >
                    Yes, Reset Progress
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credits */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-1 text-slate-500 text-[11px]">
          <p className="font-semibold text-slate-400">Natural Number Game (NNG4)</p>
          <p>Created by Kevin Buzzard and the Lean Theorem Proving Community.</p>
          <p className="text-[10px] pt-1">Built as an Android Progressive Web App with offline Peano symbolic engine.</p>
        </div>
      </div>
    </div>
  );
};
