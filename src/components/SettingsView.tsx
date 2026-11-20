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
    <div className="w-full flex-1 flex flex-col bg-[#EDE2C6] overflow-hidden">
      {/* Settings Top Bar */}
      <div className="h-14 w-full bg-[#E3D4B3]/95 border-b border-[#CEBA92] px-3 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="min-h-[40px] px-2.5 rounded-xl text-[#2C2115] hover:bg-[#D5C39C] transition flex items-center gap-1.5 text-sm font-semibold active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-base font-extrabold text-[#2C2115] tracking-tight">Settings</h1>

        <div className="w-16" />
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar max-w-2xl mx-auto w-full">
        {/* Progression & Unlocks Section */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold tracking-wide text-[#8B4F0E] px-1 flex items-center gap-1.5">
            <Unlock className="w-4 h-4" />
            <span>Progression &amp; Game Rules</span>
          </div>

          <div className="bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl divide-y divide-[#D8C7A4] shadow-xs overflow-hidden">
            {/* Unlock All Tutorials / Levels */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-[#2C2115]">Unlock All Tutorials &amp; Worlds</span>
                  <span
                    className={`text-xs font-bold ${
                      progress.unlockAllTutorials ? 'text-[#8B4F0E]' : 'text-[#5C4A36]'
                    }`}
                  >
                    · {progress.unlockAllTutorials ? 'All Unlocked' : 'Progressive'}
                  </span>
                </div>
                <p className="text-sm text-[#5C4A36] leading-relaxed font-sans">
                  Instantly unlock all {totalWorlds} worlds and {totalLevels} proof levels without beating prior levels first.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!!progress.unlockAllTutorials}
                onClick={toggleUnlockAllTutorials}
                className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.unlockAllTutorials ? 'bg-[#9A5B13]' : 'bg-[#BDA67C]'
                }`}
              >
                <div
                  className={`bg-[#FDF8EC] w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    progress.unlockAllTutorials ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Unlock All Tactics in Tutorials */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-[#2C2115]">Unlock All Tactics Everywhere</span>
                  <span
                    className={`text-xs font-bold ${
                      progress.unlockAllTactics ? 'text-[#8B4F0E]' : 'text-[#5C4A36]'
                    }`}
                  >
                    · {progress.unlockAllTactics ? 'All Active' : 'Gated'}
                  </span>
                </div>
                <p className="text-sm text-[#5C4A36] leading-relaxed font-sans">
                  Enable every tactic (<code className="font-mono font-bold text-[#2C2115]">rfl</code>,{' '}
                  <code className="font-mono font-bold text-[#2C2115]">rw</code>,{' '}
                  <code className="font-mono font-bold text-[#2C2115]">induction</code>) on the keyboard from Level 1.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!!progress.unlockAllTactics}
                onClick={toggleUnlockAllTactics}
                className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.unlockAllTactics ? 'bg-[#9A5B13]' : 'bg-[#BDA67C]'
                }`}
              >
                <div
                  className={`bg-[#FDF8EC] w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    progress.unlockAllTactics ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Audio & Tactile Section */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold tracking-wide text-[#5C4A36] px-1 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#5C4A36]" />
            <span>Sound &amp; Haptic Feedback</span>
          </div>

          <div className="bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl divide-y divide-[#D8C7A4] shadow-xs overflow-hidden">
            {/* Audio */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-sm font-extrabold text-[#2C2115] flex items-center gap-2">
                  {progress.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#8B4F0E]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#7D6952]" />
                  )}
                  <span>Mathematical Sound Effects</span>
                </div>
                <p className="text-sm text-[#5C4A36] font-sans leading-relaxed">
                  Harmonic chimes for tactic success and level completion fanfare.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={progress.soundEnabled}
                onClick={toggleSound}
                className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.soundEnabled ? 'bg-[#9A5B13]' : 'bg-[#BDA67C]'
                }`}
              >
                <div
                  className={`bg-[#FDF8EC] w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    progress.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-sm font-extrabold text-[#2C2115] flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-[#8B4F0E]" />
                  <span>Haptic Vibration</span>
                </div>
                <p className="text-sm text-[#5C4A36] font-sans leading-relaxed">
                  Tactile feedback when tapping Lean tactics, symbols, and completing proofs.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={progress.hapticsEnabled}
                onClick={toggleHaptics}
                className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  progress.hapticsEnabled ? 'bg-[#9A5B13]' : 'bg-[#BDA67C]'
                }`}
              >
                <div
                  className={`bg-[#FDF8EC] w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    progress.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold tracking-wide text-[#5C4A36] px-1 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#5C4A36]" />
            <span>Display &amp; Viewport</span>
          </div>

          <div className="bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-sm font-extrabold text-[#2C2115]">Android Device Frame</span>
              <p className="text-sm text-[#5C4A36] font-sans leading-relaxed">
                Renders a Google Pixel phone shell on wide desktop screens. Turn off for full-bleed.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={progress.mobileFrameMode}
              onClick={toggleFrameMode}
              className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                progress.mobileFrameMode ? 'bg-[#9A5B13]' : 'bg-[#BDA67C]'
              }`}
            >
              <div
                className={`bg-[#FDF8EC] w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  progress.mobileFrameMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data & Backup Section */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold tracking-wide text-[#5C4A36] px-1">
            Data &amp; Backup
          </div>

          <div className="bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <button
              onClick={handleExportBackup}
              className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-[#E3D4B3] hover:bg-[#D5C39C] text-[#2C2115] border border-[#BDA67C] text-sm font-bold flex items-center justify-between transition active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {copiedBackup ? (
                  <Check className="w-4 h-4 text-[#5F5343]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#8B4F0E]" />
                )}
                <span>{copiedBackup ? 'Progress Copied to Clipboard!' : 'Export Save & Custom Theorems'}</span>
              </div>
              <span className="text-xs text-[#5C4A36] font-mono font-bold">JSON</span>
            </button>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-[#F3DDD5] hover:bg-[#ECCBC0] text-[#7C261D] border border-[#D6A696] text-sm font-bold flex items-center justify-between transition active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#922D22]" />
                  <span>Reset All Proof Progress</span>
                </div>
                <span className="text-xs text-[#922D22] font-bold">Clear</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#F3DDD5] border border-[#D6A696] space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-bold text-[#7C261D]">
                  <ShieldAlert className="w-4 h-4 text-[#922D22] shrink-0" />
                  <span>Reset all completed levels and saved proofs?</span>
                </div>
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 min-h-[42px] py-2 rounded-xl bg-[#922D22] hover:bg-[#7C261D] text-[#FDF8EC] font-bold text-sm transition active:scale-95 cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 min-h-[42px] py-2 rounded-xl bg-[#F5EEDB] hover:bg-[#E3D4B3] text-[#2C2115] border border-[#BDA67C] text-sm font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credits */}
        <div className="p-4 rounded-2xl bg-[#E3D4B3]/70 border border-[#CEBA92] text-center space-y-1 text-[#5C4A36] text-xs">
          <p className="font-extrabold text-[#2C2115] text-sm">Natural Number Game (NNG4)</p>
          <p>Created by Kevin Buzzard and the Lean Theorem Proving Community.</p>
          <p className="pt-0.5">Offline Peano arithmetic engine for Android &amp; Mobile Web.</p>
        </div>
      </div>
    </div>
  );
};
