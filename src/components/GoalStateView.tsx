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
      <div className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl p-3.5 flex items-center gap-3 animate-fade-in shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#475569] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-[#FFFFFF]" />
        </div>
        <div>
          <div className="text-base font-extrabold text-[#334155] flex flex-wrap items-center gap-2">
            <span>No goals remaining</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] font-bold">
              Proof Complete
            </span>
          </div>
          <p className="text-sm text-[#475569] mt-0.5 leading-snug">
            All goals closed and verified. Ready to continue.
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
    <div className="w-full bg-[#FFFFFF] border border-[#C5D8EC] rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Proof State Header */}
      <div className="px-3.5 py-2 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#0C1B2E] font-bold">
          <Layers className="w-4 h-4 text-[#0369A1]" />
          <span className="text-sm">Proof State</span>
          {goals.length > 1 && (
            <span className="ml-1 text-xs font-mono font-bold text-[#0369A1]">
              · {goals.length} goals remaining
            </span>
          )}
        </div>
        {activeGoal.name && (
          <span className="text-xs text-[#0284C7] font-mono font-bold bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#7DD3FC]">
            {activeGoal.name}
          </span>
        )}
      </div>

      <div className="p-3.5 space-y-2.5 text-sm font-mono">
        {/* Hypotheses List */}
        {activeGoal.hypotheses.length > 0 && (
          <div className="space-y-1 pb-2.5 border-b border-[#D6E5F4]">
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
                  className="flex items-center justify-between min-h-[34px] group hover:bg-[#F0F7FF] active:bg-[#DCE9F7] px-2 py-1 rounded-lg cursor-pointer transition"
                  title={`Tap to insert ${actionHint}`}
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-bold text-[#0284C7]">{hyp.name}</span>
                    <span className="text-[#6E87A0]">:</span>
                    <span className={hyp.isVariable ? 'text-[#475569] font-semibold' : 'text-[#0369A1] font-semibold'}>
                      {hyp.type}
                    </span>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-[#6E87A0] group-hover:text-[#0C1B2E] shrink-0 ml-2 transition" />
                </div>
              );
            })}
          </div>
        )}

        {/* Target Line (with turnstile ⊢) */}
        <div className="flex items-baseline gap-2.5 pt-0.5 px-1">
          <span className="text-lg font-extrabold text-[#0369A1] select-none">⊢</span>
          <span className="text-base sm:text-lg font-bold text-[#0C1B2E] tracking-wide break-words leading-snug">
            {activeGoal.target}
          </span>
        </div>

        {/* Prompt when both sides are definitionally identical and ready for rfl */}
        {isReadyForRfl && !error && (
          <div className="flex items-center gap-2 text-sm text-[#075985] bg-[#E0F2FE] border border-[#7DD3FC] px-3 py-2 rounded-xl animate-fade-in font-sans font-medium">
            <Sparkles className="w-4 h-4 text-[#0284C7] shrink-0" />
            <span>
              Both sides match! Input{' '}
              <code className="font-mono font-bold text-[#0C1B2E] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#A8C4E0] text-sm">
                rfl
              </code>{' '}
              to close this goal.
            </span>
          </div>
        )}
      </div>

      {/* Error notification if tactic failed */}
      {error && (
        <div className="px-3.5 py-2.5 bg-[#FEF2F2] border-t border-[#FECACA] flex items-start gap-2.5 text-sm text-[#7F1D1D] animate-shake">
          <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-[#991B1B]">Line {error.line}: </span>
            <span>{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
