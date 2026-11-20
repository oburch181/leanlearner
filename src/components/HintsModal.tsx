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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#2C2115]/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#EDE2C6] border border-[#BDA67C] rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#E3D4B3] border-b border-[#CEBA92] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFE0BA] border border-[#C9A96E] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#9A5B13]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C2115]">Proof Guidance &amp; Hints</h3>
              <p className="text-xs text-[#5C4A36]">Step-by-step mathematical assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#5C4A36] hover:text-[#2C2115] hover:bg-[#D5C39C] transition flex items-center justify-center cursor-pointer"
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
                    ? 'bg-[#F5EEDB] border-[#CEBA92]'
                    : 'bg-[#E3D4B3]/65 border-[#CEBA92]/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-[#8B4F0E]">
                    Hint {hint.level}: {hint.title}
                  </span>
                  {!isRevealed && (
                    <button
                      onClick={() => setRevealedTier(hint.level)}
                      className="min-h-[34px] px-3 py-1 rounded-xl bg-[#EFE0BA] text-[#6E3F0A] text-xs font-bold border border-[#C9A96E] hover:bg-[#E7D4A6] cursor-pointer shrink-0"
                    >
                      Reveal Hint
                    </button>
                  )}
                </div>

                {isRevealed ? (
                  <p className="text-sm text-[#2C2115] mt-2 leading-relaxed font-sans">
                    {hint.text}
                  </p>
                ) : (
                  <p className="text-xs text-[#7D6952] italic mt-1.5">
                    Tap &quot;Reveal Hint&quot; to see this guidance.
                  </p>
                )}

                {isRevealed && hint.suggestedTactic && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#E9DEC2] font-mono text-sm font-bold text-[#8B4F0E] border border-[#CEBA92]">
                    <span>{hint.suggestedTactic}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Full Solution Section */}
          <div className="pt-2 border-t border-[#CEBA92]">
            {!showFullSolution ? (
              <button
                onClick={() => setShowFullSolution(true)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#F5EEDB] border border-[#BDA67C] hover:bg-[#E3D4B3] text-sm font-bold text-[#5C4A36] hover:text-[#2C2115] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Show Complete Proof Solution</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#EFE0BA] border border-[#C9A96E] space-y-2.5">
                <span className="text-sm font-extrabold text-[#6E3F0A]">Canonical Solution:</span>
                <pre className="p-3 rounded-xl bg-[#F5EEDB] font-mono text-sm text-[#2C2115] font-semibold overflow-x-auto border border-[#C9A96E] whitespace-pre leading-relaxed">
                  {solution}
                </pre>
                <button
                  onClick={() => {
                    onApplySolution(solution);
                    onClose();
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#9A5B13] hover:bg-[#7C480D] text-[#FDF8EC] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
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
