import React, { useState, useEffect } from 'react';
import { X, Lightbulb, ChevronRight, Check, Eye } from 'lucide-react';
import { LevelHint } from '../types/lean';

interface HintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: LevelHint[];
  solution: string;
  onApplySolution: (sol: string) => void;
}

export const HintsModal: React.FC<HintsModalProps> = ({
  isOpen,
  onClose,
  hints,
  solution,
  onApplySolution,
}) => {
  const [revealedTier, setRevealedTier] = useState<number>(1);
  const [showFullSolution, setShowFullSolution] = useState(false);

  useEffect(() => {
    setRevealedTier(1);
    setShowFullSolution(false);
  }, [solution, hints]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Proof Guidance & Hints</h3>
              <p className="text-[10px] text-slate-400">Step-by-step mathematical assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hints Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {hints.map((hint, idx) => {
            const isRevealed = revealedTier >= hint.level;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition ${
                  isRevealed
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">
                    Hint {hint.level}: {hint.title}
                  </span>
                  {!isRevealed && (
                    <button
                      onClick={() => setRevealedTier(hint.level)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/30 hover:bg-amber-500/30"
                    >
                      Reveal Hint
                    </button>
                  )}
                </div>

                {isRevealed ? (
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                    {hint.text}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    Tap &quot;Reveal Hint&quot; to see this guidance.
                  </p>
                )}

                {isRevealed && hint.suggestedTactic && (
                  <div className="mt-2 p-1.5 rounded bg-slate-900 font-mono text-xs text-indigo-300 border border-slate-800 flex items-center justify-between">
                    <span>{hint.suggestedTactic}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Full Solution Section */}
          <div className="pt-2 border-t border-slate-800">
            {!showFullSolution ? (
              <button
                onClick={() => setShowFullSolution(true)}
                className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Complete Proof Solution</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <span className="text-xs font-bold text-indigo-300">Canonical Solution:</span>
                <pre className="p-2 rounded bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800 whitespace-pre">
                  {solution}
                </pre>
                <button
                  onClick={() => {
                    onApplySolution(solution);
                    onClose();
                  }}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert Solution Into Editor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
