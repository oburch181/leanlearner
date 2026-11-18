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
    <div className="w-full flex-1 flex flex-col bg-[#F4F8FC] overflow-y-auto no-scrollbar">
      {/* Top Bar */}
      <div className="h-14 w-full bg-[#E6F0FA]/95 border-b border-[#C5D8EC] px-3 flex items-center justify-between shrink-0">
        <button
          onClick={onBackToMap}
          className="min-h-[40px] px-2.5 rounded-xl text-[#0C1B2E] hover:bg-[#D5E6F7] transition flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Worlds</span>
        </button>

        <span className="text-sm font-mono font-bold text-[#36506B]">
          Level {level.number} of {world.levels.length}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHints}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#0284C7] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
            title="View Hints"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenCodex}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#0369A1] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
            title="Theorem Codex"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Briefing Body */}
      <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* World Info & Level Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[#0369A1]">
            <span>{world.name} · Level {level.number}</span>
            {isCompleted && (
              <span className="text-[#475569] flex items-center gap-1 normal-case tracking-normal text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-[#0C1B2E] tracking-tight leading-snug">
            {level.name}
          </h1>
        </div>

        {/* Theorem Statement Card */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-[#36506B]">Theorem to Prove</span>
            <span className="font-mono font-bold text-[#0369A1]">Lean 4</span>
          </div>
          <div className="p-3 rounded-xl bg-[#EDF4FC] border border-[#C5D8EC] font-mono text-sm text-[#334155] font-semibold leading-relaxed overflow-x-auto">
            {level.statement}
          </div>
        </div>

        {/* Story & Mathematical Intuition */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0C1B2E]">
            <BookOpen className="w-4 h-4 text-[#0369A1]" />
            <span>Mathematical Motivation</span>
          </div>
          <p className="text-[15px] text-[#0C1B2E] leading-relaxed font-sans">
            {level.story}
          </p>
          <p className="text-sm text-[#36506B] leading-relaxed pt-2.5 border-t border-[#D6E5F4] font-sans whitespace-pre-line">
            {level.explanation}
          </p>
        </div>

        {/* New Tactic Showcase if applicable */}
        {newTacticIntro && (
          <div className="p-4 rounded-2xl bg-[#E0F2FE] border border-[#7DD3FC] space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#0369A1]">
              <Sparkles className="w-4 h-4 text-[#0369A1] shrink-0" />
              <span>
                New Tactic:{' '}
                <code className="text-[#0C1B2E] bg-[#FFFFFF] px-2 py-0.5 rounded-md border border-[#7DD3FC] font-mono">
                  {newTacticIntro.name}
                </code>
              </span>
            </div>
            <p className="text-sm text-[#0C1B2E] leading-relaxed">
              {newTacticIntro.description}
            </p>
          </div>
        )}

        {/* Goal Preview */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0C1B2E]">
            <Layers className="w-4 h-4 text-[#0369A1]" />
            <span>Target Goal Preview</span>
          </div>

          <div className="p-3 rounded-xl bg-[#EDF4FC] border border-[#C5D8EC] font-mono text-sm space-y-1.5">
            {level.initialHypotheses.length > 0 && (
              <div className="text-sm text-[#36506B] space-y-1 pb-2 border-b border-[#C5D8EC]">
                {level.initialHypotheses.map((h) => (
                  <div key={h.id}>
                    <span className="text-[#0284C7] font-bold">{h.name}</span> :{' '}
                    <span className="text-[#0C1B2E] font-medium">{h.type}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-0.5 text-[#0C1B2E] font-bold text-base flex items-baseline gap-2.5">
              <span className="text-[#0369A1]">⊢</span>
              <span>{level.initialTarget}</span>
            </div>
          </div>
        </div>

        {/* Start Proof CTA Button */}
        <button
          onClick={onStartProof}
          className="w-full min-h-[52px] py-3.5 rounded-2xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-[#FFFFFF]" />
          <span>Enter Proof Lab</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Prev / Next Level Navigation */}
        <div className="flex items-center justify-between gap-3 pt-1 pb-3">
          <button
            onClick={onPrevLevel}
            disabled={!hasPrevLevel}
            className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-bold transition ${
              hasPrevLevel
                ? 'bg-[#FFFFFF] border-[#A8C4E0] text-[#0C1B2E] hover:bg-[#E6F0FA] cursor-pointer'
                : 'opacity-35 pointer-events-none border-transparent'
            }`}
          >
            ← Previous Level
          </button>

          <button
            onClick={onNextLevel}
            disabled={!hasNextLevel}
            className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-bold transition ${
              hasNextLevel
                ? 'bg-[#FFFFFF] border-[#A8C4E0] text-[#0C1B2E] hover:bg-[#E6F0FA] cursor-pointer'
                : 'opacity-35 pointer-events-none border-transparent'
            }`}
          >
            Next Level →
          </button>
        </div>
      </div>
    </div>
  );
};
