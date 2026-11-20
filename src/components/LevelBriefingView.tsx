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
    <div className="w-full flex-1 flex flex-col bg-[#EDE2C6] overflow-y-auto no-scrollbar">
      {/* Top Bar */}
      <div className="h-14 w-full bg-[#E3D4B3]/95 border-b border-[#CEBA92] px-3 flex items-center justify-between shrink-0">
        <button
          onClick={onBackToMap}
          className="min-h-[40px] px-2.5 rounded-xl text-[#2C2115] hover:bg-[#D5C39C] transition flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Worlds</span>
        </button>

        <span className="text-sm font-mono font-bold text-[#5C4A36] tabular-nums">
          Level {level.number} of {world.levels.length}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHints}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#9A5B13] hover:bg-[#D5C39C] transition flex items-center justify-center cursor-pointer"
            title="View Hints"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenCodex}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#8B4F0E] hover:bg-[#D5C39C] transition flex items-center justify-center cursor-pointer"
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
          <div className="flex items-center justify-between gap-2 text-xs font-bold tracking-wide text-[#8B4F0E]">
            <span>{world.name} · Level {level.number}</span>
            {isCompleted && (
              <span className="text-[#5F5343] flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-[#2C2115] tracking-tight leading-snug text-balance">
            {level.name}
          </h1>
        </div>

        {/* Theorem Statement Card */}
        <div className="p-4 rounded-2xl bg-[#F5EEDB] border border-[#CEBA92] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tracking-wide text-[#5C4A36]">Theorem to Prove</span>
            <span className="font-mono font-bold text-[#8B4F0E]">Lean 4</span>
          </div>
          <div className="p-3 rounded-xl bg-[#E9DEC2] border border-[#CEBA92] font-mono text-sm text-[#3D3224] font-semibold leading-relaxed overflow-x-auto">
            {level.statement}
          </div>
        </div>

        {/* Story & Mathematical Intuition */}
        <div className="p-4 rounded-2xl bg-[#F5EEDB] border border-[#CEBA92] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#2C2115]">
            <BookOpen className="w-4 h-4 text-[#8B4F0E]" />
            <span>Mathematical Motivation</span>
          </div>
          <p className="text-[15px] text-[#2C2115] leading-relaxed font-sans">
            {level.story}
          </p>
          <p className="text-sm text-[#5C4A36] leading-relaxed pt-2.5 border-t border-[#D8C7A4] font-sans whitespace-pre-line">
            {level.explanation}
          </p>
        </div>

        {/* New Tactic Showcase if applicable */}
        {newTacticIntro && (
          <div className="p-4 rounded-2xl bg-[#EFE0BA] border border-[#C9A96E] space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#6E3F0A]">
              <Sparkles className="w-4 h-4 text-[#8B4F0E] shrink-0" />
              <span>
                New Tactic:{' '}
                <code className="text-[#2C2115] bg-[#F5EEDB] px-2 py-0.5 rounded-md border border-[#C9A96E] font-mono">
                  {newTacticIntro.name}
                </code>
              </span>
            </div>
            <p className="text-sm text-[#2C2115] leading-relaxed">
              {newTacticIntro.description}
            </p>
          </div>
        )}

        {/* Goal Preview */}
        <div className="p-4 rounded-2xl bg-[#F5EEDB] border border-[#CEBA92] space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2C2115]">
            <Layers className="w-4 h-4 text-[#8B4F0E]" />
            <span>Target Goal Preview</span>
          </div>

          <div className="p-3 rounded-xl bg-[#E9DEC2] border border-[#CEBA92] font-mono text-sm space-y-1.5">
            {level.initialHypotheses.length > 0 && (
              <div className="text-sm text-[#5C4A36] space-y-1 pb-2 border-b border-[#CEBA92]">
                {level.initialHypotheses.map((h) => (
                  <div key={h.id}>
                    <span className="text-[#7B4B2A] font-bold">{h.name}</span> :{' '}
                    <span className="text-[#2C2115] font-medium">{h.type}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-0.5 text-[#2C2115] font-bold text-base flex items-baseline gap-2.5">
              <span className="text-[#8B4F0E]">⊢</span>
              <span>{level.initialTarget}</span>
            </div>
          </div>
        </div>

        {/* Start Proof CTA Button */}
        <button
          onClick={onStartProof}
          className="w-full min-h-[52px] py-3.5 rounded-2xl bg-[#9A5B13] hover:bg-[#7C480D] text-[#FDF8EC] font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-[#FDF8EC]" />
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
                ? 'bg-[#F5EEDB] border-[#BDA67C] text-[#2C2115] hover:bg-[#E3D4B3] cursor-pointer'
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
                ? 'bg-[#F5EEDB] border-[#BDA67C] text-[#2C2115] hover:bg-[#E3D4B3] cursor-pointer'
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
