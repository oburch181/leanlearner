import React from 'react';
import { GoalState } from '../types/lean';
import { CheckCircle2, AlertTriangle, Layers, Copy, Sparkles } from 'lucide-react';
import { splitEquality, exprsMatch } from '../engine/leanEngine';

interface GoalStateViewProps {
  goals: GoalState[];
  isComplete: boolean;
  error?: {
    line: number;
    message: string;
  };
  onInsertLemma?: (text: string) => void;
}

export const GoalStateView: React.FC<GoalStateViewProps> = ({
  goals,
  isComplete,
  error,
  onInsertLemma,
}) => {
  if (isComplete) {
    return (
      <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 animate-fade-in shadow-inner">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
            <span>No goals</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Proof Complete! 🎉
            </span>
          </div>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            All goals closed! The theorem has been rigorously verified and added to your Codex.
          </p>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return null;
  }

  const activeGoal = goals[0];
  const eq = activeGoal ? splitEquality(activeGoal.target) : null;
  const leMatch = activeGoal ? activeGoal.target.match(/^(.+?)\s*(?:≤|<=)\s*(.+)$/) : null;
  const isReadyForRfl = eq
    ? exprsMatch(eq[0], eq[1])
    : leMatch
    ? exprsMatch(leMatch[1], leMatch[2])
    : false;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col">
      {/* Proof State Header */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Proof State</span>
          {goals.length > 1 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-[10px]">
              {goals.length} goals remaining
            </span>
          )}
        </div>
        {activeGoal.name && (
          <span className="text-[11px] text-amber-300/90 font-mono bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
            {activeGoal.name}
          </span>
        )}
      </div>

      <div className="p-2.5 space-y-2 text-xs font-mono">
        {/* Hypotheses List */}
        {activeGoal.hypotheses.length > 0 && (
          <div className="space-y-1 pb-1.5 border-b border-slate-800/60">
            {activeGoal.hypotheses.map((hyp) => {
              const snippet = hyp.isVariable
                ? hyp.name
                : hyp.type.includes('=')
                ? `rw [${hyp.name}]\n`
                : hyp.type.includes('→')
                ? `apply ${hyp.name}\n`
                : `exact ${hyp.name}\n`;
              const actionHint = snippet.trim();

              return (
                <div
                  key={hyp.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onInsertLemma && onInsertLemma(snippet)}
                  className="flex items-baseline justify-between group hover:bg-slate-800/60 px-1.5 py-0.5 rounded cursor-pointer transition"
                  title={`Tap to insert ${actionHint}`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-amber-400">{hyp.name}</span>
                    <span className="text-slate-500">:</span>
                    <span className={hyp.isVariable ? 'text-sky-300' : 'text-indigo-200'}>
                      {hyp.type}
                    </span>
                  </div>
                  <Copy className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                </div>
              );
            })}
          </div>
        )}

        {/* Target Line (with turnstile ⊢) */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-bold text-indigo-400 select-none">⊢</span>
          <span className="text-sm font-bold text-white tracking-wide break-all">
            {activeGoal.target}
          </span>
        </div>

        {/* Prompt when both sides are definitionally identical and ready for rfl */}
        {isReadyForRfl && !error && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg animate-fade-in font-sans">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Both sides match! Input <code className="font-mono font-bold text-white bg-slate-900 px-1 py-0.5 rounded border border-slate-700 text-[10px]">rfl</code> to close this goal.</span>
          </div>
        )}
      </div>

      {/* Error notification if tactic failed */}
      {error && (
        <div className="px-3 py-2 bg-rose-950/60 border-t border-rose-800/50 flex items-start gap-2 text-[11px] text-rose-200 animate-shake">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-300">Line {error.line}: </span>
            <span>{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
