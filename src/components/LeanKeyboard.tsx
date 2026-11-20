import React, { useState, useRef, useEffect } from 'react';
import { 
  Delete, 
  CornerDownLeft, 
  ChevronDown, 
  ChevronUp, 
  Space, 
  ChevronLeft, 
  ChevronRight, 
  Lock 
} from 'lucide-react';
import { playKeyClick, playTacticError } from '../utils/audio';

interface LeanKeyboardProps {
  onInsertText: (text: string, cursorOffsetFromEnd?: number) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onMoveCursor?: (direction: 'left' | 'right') => void;
  soundEnabled: boolean;
  unlockedTheorems?: string[];
  currentWorldId?: string;
  currentLevelNumber?: number;
  unlockAllTactics?: boolean;
}

export const LeanKeyboard: React.FC<LeanKeyboardProps> = ({
  onInsertText,
  onBackspace,
  onEnter,
  onMoveCursor,
  soundEnabled,
  unlockedTheorems = [],
  currentWorldId = 'tutorial',
  currentLevelNumber = 1,
  unlockAllTactics = false,
}) => {
  const [activeTab, setActiveTab] = useState<'tactics' | 'variables' | 'symbols' | 'lemmas'>('tactics');
  const [isMinimized, setIsMinimized] = useState(false);
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  const backspaceTimerRef = useRef<{ timeoutId?: number; intervalId?: number }>({});
  const lockNoticeTimerRef = useRef<number | undefined>(undefined);

  const startBackspaceRepeat = () => {
    playKeyClick(soundEnabled);
    onBackspace();

    if (backspaceTimerRef.current.timeoutId) {
      window.clearTimeout(backspaceTimerRef.current.timeoutId);
    }
    if (backspaceTimerRef.current.intervalId) {
      window.clearInterval(backspaceTimerRef.current.intervalId);
    }

    backspaceTimerRef.current.timeoutId = window.setTimeout(() => {
      backspaceTimerRef.current.intervalId = window.setInterval(() => {
        onBackspace();
      }, 50);
    }, 320);
  };

  const stopBackspaceRepeat = () => {
    if (backspaceTimerRef.current.timeoutId) {
      window.clearTimeout(backspaceTimerRef.current.timeoutId);
      backspaceTimerRef.current.timeoutId = undefined;
    }
    if (backspaceTimerRef.current.intervalId) {
      window.clearInterval(backspaceTimerRef.current.intervalId);
      backspaceTimerRef.current.intervalId = undefined;
    }
  };

  useEffect(() => {
    return () => {
      stopBackspaceRepeat();
      if (lockNoticeTimerRef.current) {
        window.clearTimeout(lockNoticeTimerRef.current);
      }
    };
  }, []);

  const handlePress = (text: string, cursorOffsetFromEnd: number = 0) => {
    playKeyClick(soundEnabled);
    onInsertText(text, cursorOffsetFromEnd);
  };

  const showLockedNotice = (msg: string) => {
    playTacticError(soundEnabled, false);
    setLockNotice(msg);
    if (lockNoticeTimerRef.current) {
      window.clearTimeout(lockNoticeTimerRef.current);
    }
    lockNoticeTimerRef.current = window.setTimeout(() => {
      setLockNotice(null);
      lockNoticeTimerRef.current = undefined;
    }, 2500);
  };

  // Check if tactic is unlocked for current level
  const isTacticUnlocked = (tactic: string): { unlocked: boolean; reason?: string } => {
    if (unlockAllTactics) return { unlocked: true };
    if (tactic === 'rfl') return { unlocked: true };

    if (tactic === 'rw' || tactic === 'rw [ ]') {
      const unlocked = currentWorldId !== 'tutorial' || currentLevelNumber >= 2;
      return { unlocked, reason: 'Unlocked in Tutorial Level 2' };
    }

    if (tactic === 'rw [← ]') {
      const unlocked = currentWorldId !== 'tutorial' || currentLevelNumber >= 3;
      return { unlocked, reason: 'Unlocked in Tutorial Level 3' };
    }

    if (tactic === 'induction') {
      const unlocked = currentWorldId !== 'tutorial';
      return { unlocked, reason: 'Unlocked in Addition World Level 1' };
    }

    if (tactic === 'exact' || tactic === 'intro') {
      const unlocked =
        currentWorldId === 'implication' ||
        currentWorldId === 'inequality' ||
        currentWorldId === 'freeplay';
      return { unlocked, reason: 'Unlocked in Implication World' };
    }

    if (tactic === 'repeat') {
      const unlocked = currentWorldId !== 'tutorial' || currentLevelNumber >= 4;
      return { unlocked, reason: 'Unlocked in Tutorial Level 4' };
    }

    return { unlocked: true };
  };

  const coreTactics = [
    { label: 'rfl', insert: 'rfl\n', offset: 0, tacticKey: 'rfl' },
    { label: 'rw [ ]', insert: 'rw []', offset: -1, tacticKey: 'rw [ ]' },
    { label: 'rw [← ]', insert: 'rw [← ]', offset: -1, tacticKey: 'rw [← ]' },
    { label: 'induction', insert: 'induction  with d hd\n', offset: -11, tacticKey: 'induction' },
    { label: 'exact', insert: 'exact ', offset: 0, tacticKey: 'exact' },
    { label: 'intro', insert: 'intro ', offset: 0, tacticKey: 'intro' },
    { label: 'repeat', insert: 'repeat ', offset: 0, tacticKey: 'repeat' },
  ];

  const variables = [
    'x', 'y', 'z', 'a', 'b', 'c', 'd',
    'h', 'h1', 'h2', 'hd', 'n', 'm',
    'P', 'Q', 'R', '(', ')'
  ];

  const symbols = [
    'ℕ', '←', '→', '∀', '·', '|', 'succ', 
    '+', '*', '^', '=', '≤', 
    '0', '1', '2', '3', '4'
  ];

  const defaultLemmas = [
    'add_zero',
    'add_succ',
    'zero_add',
    'succ_add',
    'add_comm',
    'add_assoc',
    'mul_zero',
    'mul_succ',
    'one_eq_succ_zero',
  ];

  const displayedLemmas = Array.from(new Set([...unlockedTheorems, ...defaultLemmas]));

  return (
    <div className="w-full bg-[#DAC8A2] border-t border-[#BDA67C] flex flex-col select-none transition-all duration-200">
      {/* Toast Notice when tapping locked tactic */}
      {lockNotice && (
        <div className="bg-[#EFE0BA] border-b border-[#C9A96E] px-3 py-1.5 flex items-center justify-center gap-2 text-xs text-[#6E3F0A] animate-fade-in font-bold">
          <Lock className="w-3.5 h-3.5 text-[#8B4F0E] shrink-0" />
          <span>{lockNotice}</span>
        </div>
      )}

      {/* Keyboard Header / Tab Switcher */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#D0BC92] border-b border-[#BDA67C] gap-1.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('tactics');
              setIsMinimized(false);
            }}
            className={`px-2.5 min-h-[34px] rounded-lg font-bold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'tactics' && !isMinimized
                ? 'bg-[#9A5B13] text-[#FDF8EC] shadow-xs'
                : 'text-[#4A3B2C] hover:bg-[#C5AF82]'
            }`}
          >
            Tactics
          </button>
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('variables');
              setIsMinimized(false);
            }}
            className={`px-2.5 min-h-[34px] rounded-lg font-bold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'variables' && !isMinimized
                ? 'bg-[#9A5B13] text-[#FDF8EC] shadow-xs'
                : 'text-[#4A3B2C] hover:bg-[#C5AF82]'
            }`}
          >
            Vars
          </button>
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('symbols');
              setIsMinimized(false);
            }}
            className={`px-2.5 min-h-[34px] rounded-lg font-bold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'symbols' && !isMinimized
                ? 'bg-[#9A5B13] text-[#FDF8EC] shadow-xs'
                : 'text-[#4A3B2C] hover:bg-[#C5AF82]'
            }`}
          >
            Symbols
          </button>
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('lemmas');
              setIsMinimized(false);
            }}
            className={`px-2.5 min-h-[34px] rounded-lg font-bold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'lemmas' && !isMinimized
                ? 'bg-[#9A5B13] text-[#FDF8EC] shadow-xs'
                : 'text-[#4A3B2C] hover:bg-[#C5AF82]'
            }`}
          >
            Lemmas
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick symbols bar */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[140px] no-scrollbar">
            {['←', '·', 'ℕ', 'succ'].map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePress(s)}
                className="px-2 min-h-[32px] rounded-lg bg-[#F5EEDB] border border-[#BDA67C] text-[#8B4F0E] font-mono font-bold text-xs active:scale-95 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              playKeyClick(soundEnabled);
              setIsMinimized(!isMinimized);
            }}
            className="min-w-[34px] min-h-[34px] rounded-lg text-[#4A3B2C] hover:bg-[#C5AF82] active:scale-95 flex items-center justify-center cursor-pointer"
            title={isMinimized ? 'Expand Lean Keyboard' : 'Minimize Lean Keyboard'}
          >
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Keys Area */}
      {!isMinimized && (
        <div className="p-2.5 space-y-2 max-h-[215px] overflow-y-auto no-scrollbar">
          {/* 1. Tactics Tab with Progressive Locking */}
          {activeTab === 'tactics' && (
            <div className="grid grid-cols-4 gap-2">
              {coreTactics.map((t) => {
                const status = isTacticUnlocked(t.tacticKey);

                if (!status.unlocked) {
                  return (
                    <button
                      key={t.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => showLockedNotice(status.reason || 'Locked tactic')}
                      className="min-h-[42px] py-2 px-1.5 rounded-xl bg-[#D0BC92] border border-[#BDA67C] text-[#6E5C47] font-mono text-xs font-bold flex items-center justify-center gap-1 opacity-70 cursor-not-allowed"
                      title={status.reason}
                    >
                      <Lock className="w-3.5 h-3.5 text-[#6E5C47]" />
                      <span>{t.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={t.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePress(t.insert, t.offset)}
                    className="min-h-[42px] py-2 px-1.5 rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#2C2115] hover:bg-[#EFE5CC] active:bg-[#9A5B13] active:text-[#FDF8EC] font-mono text-sm font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}

              {/* Quick helper for add_zero if unlocked */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const status = isTacticUnlocked('rw');
                  if (!status.unlocked) {
                    showLockedNotice(status.reason || 'Locked');
                  } else {
                    handlePress('rw [add_zero]\n', 0);
                  }
                }}
                className={`min-h-[42px] py-2 px-1 rounded-xl font-mono text-xs font-bold transition active:scale-95 border border-b-2 ${
                  isTacticUnlocked('rw').unlocked
                    ? 'bg-[#EFE0BA] border-[#C9A96E] text-[#6E3F0A] hover:bg-[#E7D4A6] active:bg-[#9A5B13] active:text-[#FDF8EC] cursor-pointer'
                    : 'bg-[#D0BC92] border-[#BDA67C] text-[#6E5C47] opacity-70 cursor-not-allowed'
                }`}
              >
                rw [add_0]
              </button>
            </div>
          )}

          {/* 2. Variables & Identifiers Tab */}
          {activeTab === 'variables' && (
            <div className="grid grid-cols-6 gap-2">
              {variables.map((v) => (
                <button
                  key={v}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePress(v)}
                  className="min-h-[42px] py-2 rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#7B4B2A] hover:bg-[#EFE5CC] active:bg-[#7B4B2A] active:text-[#FDF8EC] font-mono text-base font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {/* 3. Symbols Tab */}
          {activeTab === 'symbols' && (
            <div className="grid grid-cols-6 gap-2">
              {symbols.map((sym) => (
                <button
                  key={sym}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePress(sym)}
                  className="min-h-[42px] py-2 rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#5F5343] hover:bg-[#EFE5CC] active:bg-[#5F5343] active:text-[#FDF8EC] font-mono text-sm font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}

          {/* 4. Lemmas Tab */}
          {activeTab === 'lemmas' && (
            <div className="flex flex-wrap gap-2 max-h-[125px] overflow-y-auto p-0.5 no-scrollbar">
              {displayedLemmas.map((lemma) => {
                const rwStatus = isTacticUnlocked('rw');
                return (
                  <button
                    key={lemma}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!rwStatus.unlocked) {
                        showLockedNotice(rwStatus.reason || 'Locked tactic');
                      } else {
                        handlePress(`rw [${lemma}]\n`);
                      }
                    }}
                    className={`min-h-[38px] py-1.5 px-3 rounded-xl font-mono text-xs font-bold transition active:scale-95 border border-b-2 ${
                      rwStatus.unlocked
                        ? 'bg-[#F5EEDB] border-[#C9A96E] text-[#8B4F0E] hover:bg-[#EFE0BA] active:bg-[#9A5B13] active:text-[#FDF8EC] cursor-pointer'
                        : 'bg-[#D0BC92] border-[#BDA67C] text-[#6E5C47] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    {lemma}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Row: Cursor Navigation, Space, Tab, Backspace, Enter */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {/* Cursor Left */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playKeyClick(soundEnabled);
                onMoveCursor?.('left');
              }}
              className="min-w-[40px] min-h-[42px] rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#2C2115] hover:bg-[#EFE5CC] active:scale-95 flex items-center justify-center cursor-pointer"
              title="Move cursor left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Cursor Right */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playKeyClick(soundEnabled);
                onMoveCursor?.('right');
              }}
              className="min-w-[40px] min-h-[42px] rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#2C2115] hover:bg-[#EFE5CC] active:scale-95 flex items-center justify-center cursor-pointer"
              title="Move cursor right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Tab */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress('  ')}
              className="min-h-[42px] px-3 rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#2C2115] text-xs font-mono font-bold hover:bg-[#EFE5CC] active:scale-95 cursor-pointer"
              title="Indent 2 spaces"
            >
              Tab
            </button>

            {/* Space */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress(' ')}
              className="flex-1 min-h-[42px] rounded-xl bg-[#F5EEDB] border border-[#BDA67C] border-b-2 text-[#2C2115] font-semibold flex items-center justify-center gap-1.5 text-xs hover:bg-[#EFE5CC] active:scale-95 cursor-pointer"
            >
              <Space className="w-4 h-4" />
              <span>Space</span>
            </button>

            {/* Backspace with continuous hold-to-delete */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                startBackspaceRepeat();
              }}
              onPointerUp={stopBackspaceRepeat}
              onPointerLeave={stopBackspaceRepeat}
              onPointerCancel={stopBackspaceRepeat}
              onContextMenu={(e) => e.preventDefault()}
              className="min-w-[48px] min-h-[42px] px-3 rounded-xl bg-[#F3DDD5] border border-[#D6A696] border-b-2 text-[#7C261D] hover:bg-[#ECCBC0] active:bg-[#E2B5A6] active:scale-95 flex items-center justify-center select-none touch-none cursor-pointer"
              title="Backspace (Hold to delete continuously)"
            >
              <Delete className="w-5 h-5" />
            </button>

            {/* Enter */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playKeyClick(soundEnabled);
                onEnter();
              }}
              className="min-w-[52px] min-h-[42px] px-4 rounded-xl bg-[#9A5B13] text-[#FDF8EC] font-bold flex items-center justify-center gap-1 hover:bg-[#7C480D] active:scale-95 shadow-sm cursor-pointer"
              title="New Line / Step"
            >
              <CornerDownLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
