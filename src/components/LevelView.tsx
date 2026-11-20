import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { LevelDef, WorldDef } from '../types/lean';
import { verifyProof, ProofResult } from '../engine/leanEngine';
import { GoalStateView } from './GoalStateView';
import { LeanEditor, LeanEditorHandle } from './LeanEditor';
import { LeanKeyboard } from './LeanKeyboard';
import { Header } from './Header';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Lightbulb, 
  Sparkles,
  Info
} from 'lucide-react';
import { playTacticSuccess, playTacticError, playLevelVictory } from '../utils/audio';

interface LevelViewProps {
  level: LevelDef;
  world: WorldDef;
  onBackToMap: () => void;
  onOpenBriefing: () => void;
  onNextLevel?: () => void;
  onPrevLevel?: () => void;
  hasNextLevel: boolean;
  hasPrevLevel: boolean;
  onLevelCompleted: (levelId: string) => void;
  unlockedLemmas: string[];
  savedCode?: string;
  onSaveCode: (levelId: string, code: string) => void;
  onOpenCodex: () => void;
  onOpenHints: () => void;
  onOpenAndroidInstall: () => void;
  onOpenSettings?: () => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleSound: () => void;
  unlockAllTactics?: boolean;
  externalCodeVersion?: number;
  onRegisterInsertHandler?: (handler: ((text: string) => void) | null) => void;
}

export const LevelView: React.FC<LevelViewProps> = ({
  level,
  world,
  onBackToMap,
  onOpenBriefing,
  onNextLevel,
  onPrevLevel,
  hasNextLevel,
  hasPrevLevel,
  onLevelCompleted,
  unlockedLemmas,
  savedCode,
  onSaveCode,
  onOpenCodex,
  onOpenHints,
  onOpenAndroidInstall,
  onOpenSettings,
  soundEnabled,
  hapticsEnabled,
  onToggleSound,
  unlockAllTactics = false,
  externalCodeVersion = 0,
  onRegisterInsertHandler,
}) => {
  const [code, setCode] = useState(savedCode ?? level.starterCode ?? '');
  const [proofResult, setProofResult] = useState<ProofResult>(() =>
    verifyProof(savedCode ?? level.starterCode ?? '', [
      {
        id: 'initial_goal',
        target: level.initialTarget,
        hypotheses: level.initialHypotheses,
      },
    ])
  );
  const [completedCelebrated, setCompletedCelebrated] = useState(false);
  const [useSystemKeyboard, setUseSystemKeyboard] = useState(false);
  const editorRef = useRef<LeanEditorHandle>(null);

  // Register active editor insert handler for Theorem Codex
  useEffect(() => {
    if (!onRegisterInsertHandler) return;
    onRegisterInsertHandler((text: string) => {
      editorRef.current?.insertText(text, 0);
    });
    return () => onRegisterInsertHandler(null);
  }, [onRegisterInsertHandler]);

  // Sync state if level prop or external solution insertion changes
  useEffect(() => {
    const initialCode = savedCode ?? level.starterCode ?? '';
    setCode(initialCode);
    setCompletedCelebrated(false);
    const res = verifyProof(initialCode, [
      {
        id: 'initial_goal',
        target: level.initialTarget,
        hypotheses: level.initialHypotheses,
      },
    ]);
    setProofResult(res);
  }, [level.id, externalCodeVersion]);

  const isIncompleteTemplateLine = (script: string, errorLine?: number): boolean => {
    if (!errorLine) return false;
    const line = (script.split('\n')[errorLine - 1] || '').trim();
    return (
      /^rw\s*\[\s*(?:←\s*)?\]$/.test(line) ||
      /^induction\s+with\b/.test(line) ||
      /^(?:exact|intro|apply|repeat|induction)$/.test(line)
    );
  };

  // Handle proof verification on code change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onSaveCode(level.id, newCode);

    const res = verifyProof(newCode, [
      {
        id: 'initial_goal',
        target: level.initialTarget,
        hypotheses: level.initialHypotheses,
      },
    ]);
    setProofResult(res);

    if (res.isComplete && !completedCelebrated) {
      setCompletedCelebrated(true);
      playLevelVictory(soundEnabled, hapticsEnabled);
      onLevelCompleted(level.id);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#9A5B13', '#C68632', '#D9A45B', '#6B4C35', '#A89066'],
      });
    } else if (res.error) {
      if (!isIncompleteTemplateLine(newCode, res.error.line)) {
        playTacticError(soundEnabled, hapticsEnabled);
      }
    } else if (res.stepLogs.length > 0 && res.stepLogs[res.stepLogs.length - 1].success) {
      playTacticSuccess(soundEnabled, hapticsEnabled);
    }
  };

  const handleReset = () => {
    setCompletedCelebrated(false);
    handleCodeChange(level.starterCode ?? '');
  };

  const handleInsertLemma = (snippet: string) => {
    editorRef.current?.insertText(snippet, 0);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#EDE2C6] overflow-hidden">
      {/* App Bar */}
      <Header
        title={`${world.name} · Lvl ${level.number}`}
        subtitle={level.name}
        onBack={onBackToMap}
        onOpenBriefing={onOpenBriefing}
        onOpenCodex={onOpenCodex}
        onOpenHints={onOpenHints}
        onOpenAndroidInstall={onOpenAndroidInstall}
        onOpenSettings={onOpenSettings}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        unlockedCount={unlockedLemmas.length}
      />

      {/* Main Proof Lab Workspace */}
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto no-scrollbar">
        {/* Level Goal Bar with quick Briefing button */}
        <div className="bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2 shrink-0 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm text-[#3D3224] font-bold truncate">
              {level.statement}
            </span>
          </div>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6E3F0A] hover:bg-[#E7D4A6] bg-[#EFE0BA] border border-[#C9A96E] px-2.5 min-h-[34px] rounded-xl shrink-0 active:scale-95 transition cursor-pointer"
            title="Open Story & Briefing"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
        </div>

        {/* Goal State View (Proof State) */}
        <div className="shrink-0">
          <GoalStateView
            goals={proofResult.currentGoals}
            isComplete={proofResult.isComplete}
            error={proofResult.error}
            onInsertLemma={handleInsertLemma}
          />
        </div>

        {/* Level Complete Action Card */}
        {proofResult.isComplete && (
          <div className="p-3.5 rounded-2xl bg-[#E6DAC0] border border-[#BFA982] flex items-center justify-between gap-3 shadow-sm animate-fade-in shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#5F5343] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#FDF8EC]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#2C2115] truncate">Theorem Mastered!</h4>
                <p className="text-xs text-[#5C4A36] truncate">Saved to Codex.</p>
              </div>
            </div>

            {hasNextLevel ? (
              <button
                onClick={onNextLevel}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#9A5B13] hover:bg-[#7C480D] text-[#FDF8EC] font-bold text-sm flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Next Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBackToMap}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#9A5B13] hover:bg-[#7C480D] text-[#FDF8EC] font-bold text-sm flex items-center gap-1 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <span>World Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Lean Editor */}
        <div className="flex-1 min-h-[150px] flex flex-col">
          <LeanEditor
            ref={editorRef}
            code={code}
            onChange={handleCodeChange}
            onReset={handleReset}
            errorLine={proofResult.error?.line}
            useSystemKeyboard={useSystemKeyboard}
            onToggleSystemKeyboard={() => setUseSystemKeyboard(!useSystemKeyboard)}
          />
        </div>

        {/* Navigation row: Prev / Next */}
        <div className="flex items-center justify-between text-xs pt-0.5 shrink-0">
          <button
            onClick={onPrevLevel}
            disabled={!hasPrevLevel}
            className={`min-h-[38px] flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              hasPrevLevel
                ? 'bg-[#F5EEDB] border-[#BDA67C] text-[#2C2115] hover:bg-[#E3D4B3] cursor-pointer'
                : 'opacity-35 pointer-events-none border-transparent'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-[#5C4A36] font-mono font-semibold tabular-nums">
            {world.name} · {level.number}/{world.levels.length}
          </span>

          <button
            onClick={onNextLevel}
            disabled={!hasNextLevel}
            className={`min-h-[38px] flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              hasNextLevel
                ? 'bg-[#F5EEDB] border-[#BDA67C] text-[#2C2115] hover:bg-[#E3D4B3] cursor-pointer'
                : 'opacity-35 pointer-events-none border-transparent'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Tactile Lean Keyboard */}
      <LeanKeyboard
        onInsertText={(text, offset) => editorRef.current?.insertText(text, offset)}
        onBackspace={() => editorRef.current?.backspace()}
        onEnter={() => editorRef.current?.insertNewline()}
        onMoveCursor={(dir) => editorRef.current?.moveCursor(dir)}
        soundEnabled={soundEnabled}
        unlockedTheorems={unlockedLemmas}
        currentWorldId={level.worldId}
        currentLevelNumber={level.number}
        unlockAllTactics={unlockAllTactics}
      />
    </div>
  );
};
