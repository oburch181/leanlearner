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
    <div className="w-full bg-[#DCE9F7] border-t border-[#A8C4E0] flex flex-col select-none transition-all duration-200">
      {/* Toast Notice when tapping locked tactic */}
      {lockNotice && (
        <div className="bg-[#E0F2FE] border-b border-[#7DD3FC] px-3 py-1.5 flex items-center justify-center gap-2 text-xs text-[#075985] animate-fade-in font-bold">
          <Lock className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
          <span>{lockNotice}</span>
        </div>
      )}

      {/* Keyboard Header / Tab Switcher */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#CEDFF2] border-b border-[#A8C4E0] gap-1.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              playKeyClick(soundEnabled);
              setActiveTab('tactics');
              setIsMinimized(false);
            }}
            className={`px-2.5 min-h-[34px] rounded-lg font-bold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'tactics' && !isMinimized
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
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
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
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
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
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
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
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
                className="px-2 min-h-[32px] rounded-lg bg-[#FFFFFF] border border-[#A8C4E0] text-[#0369A1] font-mono font-bold text-xs active:scale-95 cursor-pointer"
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
            className="min-w-[34px] min-h-[34px] rounded-lg text-[#36506B] hover:bg-[#C2D7EE] active:scale-95 flex items-center justify-center cursor-pointer"
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
                      className="min-h-[42px] py-2 px-1.5 rounded-xl bg-[#CEDFF2] border border-[#A8C4E0] text-[#526D88] font-mono text-xs font-bold flex items-center justify-center gap-1 opacity-65 cursor-not-allowed"
                      title={status.reason}
                    >
                      <Lock className="w-3.5 h-3.5 text-[#526D88]" />
                      <span>{t.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={t.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePress(t.insert, t.offset)}
                    className="min-h-[42px] py-2 px-1.5 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0C1B2E] hover:bg-[#F0F7FF] active:bg-[#0369A1] active:text-[#FFFFFF] font-mono text-sm font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
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
                    ? 'bg-[#E0F2FE] border-[#7DD3FC] text-[#0369A1] hover:bg-[#BAE6FD] active:bg-[#0369A1] active:text-[#FFFFFF] cursor-pointer'
                    : 'bg-[#CEDFF2] border-[#A8C4E0] text-[#526D88] opacity-65 cursor-not-allowed'
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
                  className="min-h-[42px] py-2 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0284C7] hover:bg-[#F0F7FF] active:bg-[#0284C7] active:text-[#FFFFFF] font-mono text-base font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
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
                  className="min-h-[42px] py-2 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#475569] hover:bg-[#F0F7FF] active:bg-[#475569] active:text-[#FFFFFF] font-mono text-sm font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
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
                        ? 'bg-[#FFFFFF] border-[#7DD3FC] text-[#0369A1] hover:bg-[#E0F2FE] active:bg-[#0369A1] active:text-[#FFFFFF] cursor-pointer'
                        : 'bg-[#CEDFF2] border-[#A8C4E0] text-[#526D88] opacity-65 cursor-not-allowed'
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
              className="min-w-[40px] min-h-[42px] rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0C1B2E] hover:bg-[#F0F7FF] active:scale-95 flex items-center justify-center cursor-pointer"
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
              className="min-w-[40px] min-h-[42px] rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0C1B2E] hover:bg-[#F0F7FF] active:scale-95 flex items-center justify-center cursor-pointer"
              title="Move cursor right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Tab */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress('  ')}
              className="min-h-[42px] px-3 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0C1B2E] text-xs font-mono font-bold hover:bg-[#F0F7FF] active:scale-95 cursor-pointer"
              title="Indent 2 spaces"
            >
              Tab
            </button>

            {/* Space */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePress(' ')}
              className="flex-1 min-h-[42px] rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] border-b-2 text-[#0C1B2E] font-semibold flex items-center justify-center gap-1.5 text-xs hover:bg-[#F0F7FF] active:scale-95 cursor-pointer"
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
              className="min-w-[48px] min-h-[42px] px-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] border-b-2 text-[#991B1B] hover:bg-[#FEE2E2] active:bg-[#FECACA] active:scale-95 flex items-center justify-center select-none touch-none cursor-pointer"
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
              className="min-w-[52px] min-h-[42px] px-4 rounded-xl bg-[#0369A1] text-[#FFFFFF] font-bold flex items-center justify-center gap-1 hover:bg-[#075985] active:scale-95 shadow-sm cursor-pointer"
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
