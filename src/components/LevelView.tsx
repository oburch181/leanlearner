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
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
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
    <div className="w-full flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* App Bar */}
      <Header
        title={`${world.name} • Lvl ${level.number}`}
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
      <div className="flex-1 flex flex-col p-2.5 space-y-2 overflow-y-auto no-scrollbar">
        {/* Compact Level Goal Bar with quick Briefing button */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs text-emerald-300 font-semibold truncate">
              {level.statement}
            </span>
          </div>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded-lg shrink-0 ml-2 active:scale-95 transition"
            title="Open Story & Briefing"
          >
            <Info className="w-3 h-3" />
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/50 flex items-center justify-between shadow-lg animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">Theorem Mastered!</h4>
                <p className="text-[10px] text-slate-300">Saved to Codex.</p>
              </div>
            </div>

            {hasNextLevel ? (
              <button
                onClick={onNextLevel}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
              >
                <span>Next Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBackToMap}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95"
              >
                <span>World Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Lean Editor */}
        <div className="flex-1 min-h-[140px] flex flex-col">
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
        <div className="flex items-center justify-between text-xs py-0.5 shrink-0">
          <button
            onClick={onPrevLevel}
            disabled={!hasPrevLevel}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition ${
              hasPrevLevel
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'opacity-30 pointer-events-none border-transparent'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            {world.name} • {level.number}/{world.levels.length}
          </span>

          <button
            onClick={onNextLevel}
            disabled={!hasNextLevel}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition ${
              hasNextLevel
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'opacity-30 pointer-events-none border-transparent'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
