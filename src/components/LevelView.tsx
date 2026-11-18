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
        colors: ['#0284C7', '#38BDF8', '#0EA5E9', '#1D4ED8', '#94A3B8'],
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
    <div className="w-full flex-1 flex flex-col bg-[#F4F8FC] overflow-hidden">
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
        <div className="bg-[#FFFFFF] border border-[#C5D8EC] rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2 shrink-0 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm text-[#334155] font-bold truncate">
              {level.statement}
            </span>
          </div>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1] hover:bg-[#BAE6FD] bg-[#E0F2FE] border border-[#7DD3FC] px-2.5 min-h-[34px] rounded-xl shrink-0 active:scale-95 transition cursor-pointer"
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
          <div className="p-3.5 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-between gap-3 shadow-sm animate-fade-in shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#475569] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#334155] truncate">Theorem Mastered!</h4>
                <p className="text-xs text-[#475569] truncate">Saved to Codex.</p>
              </div>
            </div>

            {hasNextLevel ? (
              <button
                onClick={onNextLevel}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Next Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBackToMap}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center gap-1 transition active:scale-95 shrink-0 cursor-pointer"
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
                ? 'bg-[#FFFFFF] border-[#A8C4E0] text-[#0C1B2E] hover:bg-[#E6F0FA] cursor-pointer'
                : 'opacity-35 pointer-events-none border-transparent'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-[#36506B] font-mono font-semibold">
            {world.name} · {level.number}/{world.levels.length}
          </span>

          <button
            onClick={onNextLevel}
            disabled={!hasNextLevel}
            className={`min-h-[38px] flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              hasNextLevel
                ? 'bg-[#FFFFFF] border-[#A8C4E0] text-[#0C1B2E] hover:bg-[#E6F0FA] cursor-pointer'
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
