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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0C1B2E]/45 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#F4F8FC] border border-[#A8C4E0] rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0C1B2E]">Proof Guidance &amp; Hints</h3>
              <p className="text-xs text-[#36506B]">Step-by-step mathematical assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#36506B] hover:text-[#0C1B2E] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {hints.map((hint, idx) => {
            const isRevealed = revealedTier >= hint.level;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition ${
                  isRevealed
                    ? 'bg-[#FFFFFF] border-[#C5D8EC]'
                    : 'bg-[#E6F0FA]/60 border-[#C5D8EC]/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-[#0284C7]">
                    Hint {hint.level}: {hint.title}
                  </span>
                  {!isRevealed && (
                    <button
                      onClick={() => setRevealedTier(hint.level)}
                      className="min-h-[34px] px-3 py-1 rounded-xl bg-[#E0F2FE] text-[#075985] text-xs font-bold border border-[#7DD3FC] hover:bg-[#BAE6FD] cursor-pointer shrink-0"
                    >
                      Reveal Hint
                    </button>
                  )}
                </div>

                {isRevealed ? (
                  <p className="text-sm text-[#0C1B2E] mt-2 leading-relaxed font-sans">
                    {hint.text}
                  </p>
                ) : (
                  <p className="text-xs text-[#526D88] italic mt-1.5">
                    Tap &quot;Reveal Hint&quot; to see this guidance.
                  </p>
                )}

                {isRevealed && hint.suggestedTactic && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#EDF4FC] font-mono text-sm font-bold text-[#0369A1] border border-[#C5D8EC]">
                    <span>{hint.suggestedTactic}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Full Solution Section */}
          <div className="pt-2 border-t border-[#C5D8EC]">
            {!showFullSolution ? (
              <button
                onClick={() => setShowFullSolution(true)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#FFFFFF] border border-[#A8C4E0] hover:bg-[#E6F0FA] text-sm font-bold text-[#36506B] hover:text-[#0C1B2E] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Show Complete Proof Solution</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#E0F2FE] border border-[#7DD3FC] space-y-2.5">
                <span className="text-sm font-extrabold text-[#0369A1]">Canonical Solution:</span>
                <pre className="p-3 rounded-xl bg-[#FFFFFF] font-mono text-sm text-[#334155] font-semibold overflow-x-auto border border-[#7DD3FC] whitespace-pre leading-relaxed">
                  {solution}
                </pre>
                <button
                  onClick={() => {
                    onApplySolution(solution);
                    onClose();
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
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
