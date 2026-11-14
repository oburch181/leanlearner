import React from 'react';
import { LevelDef, WorldDef } from '../types/lean';
import { 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Lightbulb, 
  Play, 
  CheckCircle2 
} from 'lucide-react';

interface LevelBriefingViewProps {
  level: LevelDef;
  world: WorldDef;
  isCompleted: boolean;
  onStartProof: () => void;
  onBackToMap: () => void;
  onOpenCodex: () => void;
  onOpenHints: () => void;
  hasNextLevel: boolean;
  hasPrevLevel: boolean;
  onNextLevel: () => void;
  onPrevLevel: () => void;
}

export const LevelBriefingView: React.FC<LevelBriefingViewProps> = ({
  level,
  world,
  isCompleted,
  onStartProof,
  onBackToMap,
  onOpenCodex,
  onOpenHints,
  hasNextLevel,
  hasPrevLevel,
  onNextLevel,
  onPrevLevel,
}) => {
  // Determine if this level introduces a new tactic or axiom
  const newTacticIntro = (() => {
    if (level.worldId === 'tutorial' && level.number === 1) {
      return {
        name: 'rfl',
        description: 'Proves any goal where the left-hand side is definitionally identical to the right-hand side.',
      };
    }
    if (level.worldId === 'tutorial' && level.number === 2) {
      return {
        name: 'rw [h]',
        description: 'Rewrites the goal using an equality hypothesis `h : A = B` by substituting A with B.',
      };
    }
    if (level.worldId === 'tutorial' && level.number === 3) {
      return {
        name: 'rw [← h]',
        description: 'Rewrites backwards: replaces the right-hand side B with the left-hand side A.',
      };
    }
    if (level.worldId === 'addition' && level.number === 1) {
      return {
        name: 'induction n with d hd',
        description: 'Splits the goal into Base Case (n = 0) and Inductive Step (n = succ d with hypothesis hd).',
      };
    }
    if (level.worldId === 'implication' && level.number === 1) {
      return {
        name: 'intro / exact',
        description: 'Use `intro h` to assume the hypothesis of an implication, and `exact h` to finish.',
      };
    }
    return null;
  })();

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar">
      {/* Top Bar */}
      <div className="h-12 w-full bg-slate-950/90 border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0">
        <button
          onClick={onBackToMap}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>World Map</span>
        </button>

        <span className="text-xs font-mono font-medium text-slate-400">
          Level {level.number} of {world.levels.length}
        </span>
      </div>

      {/* Main Briefing Body */}
      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* World Badge & Level Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">
            <span>{world.name}</span>
            <span>•</span>
            <span>Level {level.number}</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {level.name}
            </h1>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Theorem Statement Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Theorem to Prove</span>
            <span className="font-mono text-[10px] text-indigo-400">Lean 4</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
            {level.statement}
          </div>
        </div>

        {/* Story & Mathematical Intuition */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Mathematical Motivation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {level.story}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60 font-sans">
            {level.explanation}
          </p>
        </div>

        {/* New Tactic Showcase if applicable */}
        {newTacticIntro && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/50 border border-indigo-500/40 space-y-1.5 shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>New Tactic Unlocked: <code className="text-white bg-indigo-900/60 px-1.5 py-0.5 rounded">{newTacticIntro.name}</code></span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {newTacticIntro.description}
            </p>
          </div>
        )}

        {/* Goal Preview */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Goal Preview</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 font-mono text-xs space-y-1">
            {level.initialHypotheses.length > 0 && (
              <div className="text-[11px] text-slate-400 space-y-0.5 pb-1 border-b border-slate-800/60">
                {level.initialHypotheses.map((h) => (
                  <div key={h.id}>
                    <span className="text-amber-400 font-bold">{h.name}</span> : <span className="text-slate-300">{h.type}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-0.5 text-white font-bold flex items-baseline gap-2">
              <span className="text-indigo-400">⊢</span>
              <span>{level.initialTarget}</span>
            </div>
          </div>
        </div>

        {/* Start Proof CTA Button */}
        <button
          onClick={onStartProof}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition active:scale-98"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Enter Proof Lab</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Prev / Next Level Navigation */}
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            onClick={onPrevLevel}
            disabled={!hasPrevLevel}
            className={`px-3 py-1.5 rounded-xl border text-[11px] transition ${
              hasPrevLevel
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'opacity-30 pointer-events-none border-transparent'
            }`}
          >
            ← Previous Level
          </button>

          <button
            onClick={onNextLevel}
            disabled={!hasNextLevel}
            className={`px-3 py-1.5 rounded-xl border text-[11px] transition ${
              hasNextLevel
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'opacity-30 pointer-events-none border-transparent'
            }`}
          >
            Next Level →
          </button>
        </div>
      </div>
    </div>
  );
};
