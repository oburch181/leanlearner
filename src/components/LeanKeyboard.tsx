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
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-col select-none transition-all duration-200">
      {/* Toast Notice when tapping locked tactic */}
      {lockNotice && (
        <div className="bg-amber-950/90 border-b border-amber-600/50 px-3 py-1 flex items-center justify-center gap-1.5 text-[11px] text-amber-200 animate-fade-in font-medium">
          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{lockNotice}</span>
        </div>
      )}

      {/* Keyboard Header / Tab Switcher */}
      <div className="flex items-center justify-between px-2 py-1 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('tactics');
              setIsMinimized(false);
            }}
            className={`px-2 py-1 rounded-md font-medium text-[11px] transition ${
              activeTab === 'tactics' && !isMinimized
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            className={`px-2 py-1 rounded-md font-medium text-[11px] transition ${
              activeTab === 'variables' && !isMinimized
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('symbols');
              setIsMinimized(false);
            }}
            className={`px-2 py-1 rounded-md font-medium text-[11px] transition ${
              activeTab === 'symbols' && !isMinimized
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            className={`px-2 py-1 rounded-md font-medium text-[11px] transition ${
              activeTab === 'lemmas' && !isMinimized
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lemmas
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick symbols bar */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[130px] no-scrollbar py-0.5">
            {['←', '·', 'ℕ', 'succ'].map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePress(s)}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] active:scale-95"
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
            className="p-1 rounded text-slate-400 hover:text-slate-200 active:scale-95"
            title={isMinimized ? 'Expand Lean Keyboard' : 'Minimize Lean Keyboard'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Keys Area */}
      {!isMinimized && (
        <div className="p-2 space-y-1.5 max-h-[175px] overflow-y-auto no-scrollbar">
          {/* 1. Tactics Tab with Progressive Locking */}
          {activeTab === 'tactics' && (
            <div className="grid grid-cols-4 gap-1.5">
              {coreTactics.map((t) => {
                const status = isTacticUnlocked(t.tacticKey);

                if (!status.unlocked) {
                  return (
                    <button
                      key={t.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => showLockedNotice(status.reason || 'Locked tactic')}
                      className="py-2 px-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-500 font-mono text-xs font-semibold flex items-center justify-center gap-1 opacity-40 cursor-not-allowed"
                      title={status.reason}
                    >
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{t.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={t.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePress(t.insert, t.offset)}
                    className="py-2 px-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 text-slate-200 hover:bg-slate-700 active:bg-indigo-600 active:text-white font-mono text-xs font-semibold shadow-sm transition active:scale-95 flex items-center justify-center gap-1"
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
                className={`py-2 px-1 rounded-lg font-mono text-[11px] transition active:scale-95 ${
                  isTacticUnlocked('rw').unlocked
                    ? 'bg-indigo-950/50 border border-indigo-700/40 text-indigo-300 hover:bg-indigo-900 active:bg-indigo-600'
                    : 'bg-slate-900/40 border border-slate-800/60 text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                rw [add_0]
              </button>
            </div>
          )}

          {/* 2. Variables & Identifiers Tab */}
          {activeTab === 'variables' && (
            <div className="grid grid-cols-6 gap-1.5">
              {variables.map((v) => (
                <button
                  key={v}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePress(v)}
                  className="py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-amber-300 hover:bg-slate-700 active:bg-amber-600 active:text-white font-mono text-xs font-bold shadow-sm transition active:scale-95"
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {/* 3. Symbols Tab */}
          {activeTab === 'symbols' && (
            <div className="grid grid-cols-6 gap-1.5">
              {symbols.map((sym) => (
                <button
                  key={sym}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePress(sym)}
                  className="py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-sky-300 hover:bg-slate-700 active:bg-sky-600 active:text-white font-mono text-xs font-bold shadow-sm transition active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}

          {/* 4. Lemmas Tab */}
          {activeTab === 'lemmas' && (
            <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-0.5 no-scrollbar">
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
                    className={`py-1 px-2 rounded-md font-mono text-[11px] transition active:scale-95 ${
                      rwStatus.unlocked
                        ? 'bg-slate-800/80 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 active:bg-indigo-600 active:text-white'
                        : 'bg-slate-900/60 border border-slate-800/60 text-slate-500 opacity-40 cursor-not-allowed'
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
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-95"
              title="Move cursor left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Cursor Right */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playKeyClick(soundEnabled);
                onMoveCursor?.('right');
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-95"
              title="Move cursor right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Tab */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress('  ')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono hover:bg-slate-700 active:scale-95"
              title="Indent 2 spaces"
            >
              Tab
            </button>

            {/* Space */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress(' ')}
              className="flex-1 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center gap-1 text-[11px] hover:bg-slate-700 active:scale-95"
            >
              <Space className="w-3.5 h-3.5" />
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
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 active:bg-rose-900/80 active:scale-95 flex items-center justify-center select-none touch-none cursor-pointer"
              title="Backspace (Hold to delete continuously)"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Enter */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                playKeyClick(soundEnabled);
                onEnter();
              }}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center gap-1 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/30"
              title="New Line / Step"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
