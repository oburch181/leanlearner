import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Hypothesis, GoalState, FreeplayTheorem } from '../types/lean';
import { verifyProof, ProofResult, parseTheoremDeclaration, splitEquality, LemmaDef } from '../engine/leanEngine';
import { GoalStateView } from './GoalStateView';
import { LeanEditor, LeanEditorHandle } from './LeanEditor';
import { LeanKeyboard } from './LeanKeyboard';
import { Header } from './Header';
import { 
  Sparkles, 
  Plus, 
  FolderOpen, 
  Share2, 
  CheckCircle2, 
  RotateCcw, 
  Pencil, 
  Check, 
  X, 
  Copy, 
  BookMarked,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { playTacticSuccess, playTacticError, playLevelVictory } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';

const FREEPLAY_PRESETS = [
  {
    name: 'add_reorder',
    title: 'Commutative Associativity',
    statement: 'theorem add_reorder (a b c : ℕ) : (a + b) + c = a + (c + b)',
    description: 'Combine associativity and commutativity to swap inner terms.',
  },
  {
    name: 'double_zero',
    title: 'Double Zero Simplification',
    statement: 'theorem double_zero (a : ℕ) : a + 0 + 0 = a',
    description: 'Use repeated add_zero rewrites.',
  },
  {
    name: 'mul_one_comm',
    title: 'Multiply One & Commute',
    statement: 'theorem mul_one_comm (a b : ℕ) : (a + b) * 1 = b + a',
    description: 'Simplify multiplying by 1, then commute the addition.',
  },
  {
    name: 'pow_two_sq',
    title: 'Power of Two Definition',
    statement: 'theorem pow_two_sq (a : ℕ) : a ^ 2 = a * a',
    description: 'Unfold 2 into succ 1, then use pow_succ and pow_one.',
  },
  {
    name: 'trans_hyp',
    title: 'Hypothesis Transitivity',
    statement: 'example (x y z : ℕ) (h1 : x = y) (h2 : y = z) : x + 0 = z',
    description: 'Combine rewrite on hypotheses with add_zero.',
  },
  {
    name: 'distrib_swap',
    title: 'Distributive Reversal',
    statement: 'theorem distrib_swap (a b c : ℕ) : a * (b + c) = a * c + a * b',
    description: 'Distribute multiplication and commute the resulting sum.',
  },
];

interface FreeplayViewProps {
  onBackToHome: () => void;
  onOpenCodex: () => void;
  onOpenAndroidInstall: () => void;
  onOpenSettings?: () => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleSound: () => void;
  unlockedLemmas: string[];
  savedTheorems?: FreeplayTheorem[];
  onSaveCustomTheorem?: (theorem: FreeplayTheorem) => void;
  onDeleteCustomTheorem?: (theoremId: string) => void;
  onRegisterInsertHandler?: (handler: ((text: string) => void) | null) => void;
}

export const FreeplayView: React.FC<FreeplayViewProps> = ({
  onBackToHome,
  onOpenCodex,
  onOpenAndroidInstall,
  onOpenSettings,
  soundEnabled,
  hapticsEnabled,
  onToggleSound,
  unlockedLemmas,
  savedTheorems = [],
  onSaveCustomTheorem,
  onDeleteCustomTheorem,
  onRegisterInsertHandler,
}) => {
  // Current active theorem configuration
  const [currentStatement, setCurrentStatement] = useState<string>(
    'theorem my_identity (a b c : ℕ) : (a + b) + c = a + (c + b)'
  );
  const [proofCode, setProofCode] = useState<string>('-- Unguided Lean 4 Proof Sandbox\n-- Type tactics freely:\n');
  const [useSystemKeyboard, setUseSystemKeyboard] = useState<boolean>(false);
  const [completedCelebrated, setCompletedCelebrated] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Dialogs
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [inputStatement, setInputStatement] = useState<string>(currentStatement);

  const editorRef = useRef<LeanEditorHandle>(null);

  // Register active editor insert handler for Theorem Codex
  useEffect(() => {
    if (!onRegisterInsertHandler) return;
    onRegisterInsertHandler((text: string) => {
      editorRef.current?.insertText(text, 0);
    });
    return () => onRegisterInsertHandler(null);
  }, [onRegisterInsertHandler]);

  // Parse current statement into structured initial goal
  const parsed = useMemo(() => {
    return parseTheoremDeclaration(currentStatement);
  }, [currentStatement]);

  const initialGoals: GoalState[] = useMemo(() => {
    return [
      {
        id: 'freeplay_goal_1',
        hypotheses: parsed.hypotheses,
        target: parsed.target,
      },
    ];
  }, [parsed]);

  // Merge any saved custom theorems into available lemmas
  const extraLemmas: Record<string, LemmaDef> = useMemo(() => {
    const map: Record<string, LemmaDef> = {};
    savedTheorems.forEach((thm) => {
      const p = parseTheoremDeclaration(thm.statement);
      const eq = splitEquality(p.target);
      if (eq) {
        map[thm.name] = {
          name: thm.name,
          params: p.hypotheses.filter((h) => h.isVariable).map((h) => h.name),
          lhs: eq[0],
          rhs: eq[1],
          description: `Custom theorem: ${thm.statement}`,
        };
      }
    });
    return map;
  }, [savedTheorems]);

  // Run proof verification
  const proofResult: ProofResult = useMemo(() => {
    return verifyProof(proofCode, initialGoals, extraLemmas);
  }, [proofCode, initialGoals, extraLemmas]);

  // Handle victory triggers & reset celebration when proof becomes incomplete again
  useEffect(() => {
    if (!proofResult.isComplete) {
      setCompletedCelebrated(false);
      return;
    }
    if (proofResult.isComplete && !completedCelebrated && proofCode.trim().length > 0) {
      setCompletedCelebrated(true);
      playLevelVictory(soundEnabled, hapticsEnabled);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284C7', '#38BDF8', '#0EA5E9', '#1D4ED8', '#94A3B8'],
      });
    }
  }, [proofResult.isComplete, completedCelebrated, proofCode, soundEnabled, hapticsEnabled]);

  const handleCodeChange = (newCode: string) => {
    setProofCode(newCode);
  };

  const handleApplyPreset = (stmt: string) => {
    setCurrentStatement(stmt);
    setInputStatement(stmt);
    setProofCode('-- Freeplay Sandbox\n');
    setCompletedCelebrated(false);
    setIsSaved(false);
    setIsEditModalOpen(false);
  };

  const handleSaveTheorem = () => {
    if (!onSaveCustomTheorem) return;
    const newThm: FreeplayTheorem = {
      id: `thm_${Date.now()}`,
      name: parsed.name,
      statement: currentStatement,
      target: parsed.target,
      hypotheses: parsed.hypotheses,
      proofCode,
      isCustom: true,
    };
    onSaveCustomTheorem(newThm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyCode = async () => {
    const fullSource = `${currentStatement} := by\n${proofCode}`;
    const ok = await copyToClipboard(fullSource);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F4F8FC] overflow-hidden">
      {/* Freeplay App Bar */}
      <Header
        title="Lean 4 Freeplay"
        subtitle="Unguided Sandbox"
        onBack={onBackToHome}
        onOpenCodex={onOpenCodex}
        onOpenAndroidInstall={onOpenAndroidInstall}
        onOpenSettings={onOpenSettings}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        unlockedCount={unlockedLemmas.length}
      />

      {/* Main Freeplay Workspace */}
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto no-scrollbar">
        {/* Active Theorem Card with Edit & Presets */}
        <div className="bg-[#FFFFFF] border border-[#C5D8EC] rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-[#1D4ED8] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Target Theorem</span>
            </div>
            <div className="font-mono text-sm text-[#334155] font-bold truncate mt-0.5">
              {currentStatement}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setInputStatement(currentStatement);
                setIsEditModalOpen(true);
              }}
              className="px-3 min-h-[38px] rounded-xl bg-[#E6F0FA] hover:bg-[#D5E6F7] text-[#0C1B2E] border border-[#A8C4E0] text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Edit theorem or choose preset"
            >
              <Pencil className="w-3.5 h-3.5 text-[#0369A1]" />
              <span>Presets</span>
            </button>

            {savedTheorems.length > 0 && (
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="min-w-[38px] min-h-[38px] rounded-xl bg-[#E6F0FA] hover:bg-[#D5E6F7] text-[#0284C7] border border-[#A8C4E0] flex items-center justify-center cursor-pointer"
                title="Saved custom theorems"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Goal State View (Proof State) */}
        <div className="shrink-0">
          <GoalStateView
            goals={proofResult.currentGoals}
            isComplete={proofResult.isComplete}
            error={proofResult.error}
            onInsertLemma={(text) => editorRef.current?.insertText(text, 0)}
          />
        </div>

        {/* Celebratory Victory Bar for Freeplay */}
        {proofResult.isComplete && (
          <div className="p-3.5 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-between gap-2 shadow-sm animate-fade-in shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#475569] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#334155] truncate">Proof Formally Verified!</h4>
                <p className="text-xs text-[#475569] truncate">Closed using Lean 4 Peano axioms.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleSaveTheorem}
                disabled={isSaved}
                className="px-3 min-h-[40px] rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                <span>{isSaved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-[#FFFFFF] hover:bg-[#E6F0FA] text-[#0C1B2E] border border-[#CBD5E1] flex items-center justify-center cursor-pointer"
                title="Copy Lean 4 Source"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#475569]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Lean Code Editor */}
        <div className="flex-1 min-h-[150px] flex flex-col">
          <LeanEditor
            ref={editorRef}
            code={proofCode}
            onChange={handleCodeChange}
            onReset={() => handleCodeChange('-- Freeplay Sandbox\n')}
            errorLine={proofResult.error?.line}
            useSystemKeyboard={useSystemKeyboard}
            onToggleSystemKeyboard={() => setUseSystemKeyboard(!useSystemKeyboard)}
          />
        </div>
      </div>

      {/* Lean Keyboard with ALL tactics unlocked in Freeplay */}
      <LeanKeyboard
        onInsertText={(text, offset) => editorRef.current?.insertText(text, offset)}
        onBackspace={() => editorRef.current?.backspace()}
        onEnter={() => editorRef.current?.insertNewline()}
        onMoveCursor={(dir) => editorRef.current?.moveCursor(dir)}
        soundEnabled={soundEnabled}
        unlockedTheorems={Array.from(new Set([...unlockedLemmas, ...Object.keys(extraLemmas)]))}
        currentWorldId="freeplay"
        currentLevelNumber={999}
        unlockAllTactics={true}
      />

      {/* New Theorem / Presets Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0C1B2E]/45 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#F4F8FC] border border-[#A8C4E0] rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#0369A1]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0C1B2E]">Theorem Sandbox</h3>
                  <p className="text-xs text-[#36506B]">Configure or pick any identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-xl text-[#36506B] hover:text-[#0C1B2E] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Custom Header Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0C1B2E]">
                  Custom Lean 4 Theorem Declaration
                </label>
                <input
                  type="text"
                  value={inputStatement}
                  onChange={(e) => setInputStatement(e.target.value)}
                  placeholder="theorem my_id (a b : ℕ) : a + b = b + a"
                  className="w-full bg-[#FFFFFF] border border-[#A8C4E0] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#334155] font-semibold focus:outline-none focus:border-[#0369A1]"
                />
                <p className="text-xs text-[#36506B] leading-relaxed">
                  Type a full Lean statement (e.g. <code className="font-mono font-bold text-[#0C1B2E]">theorem test (x y : ℕ) : x + y = y + x</code>) or a plain equation (e.g. <code className="font-mono font-bold text-[#0C1B2E]">a + 0 = a</code>).
                </p>

                <button
                  onClick={() => {
                    handleApplyPreset(inputStatement.trim() || 'example (a : ℕ) : a + 0 = a');
                  }}
                  className="w-full min-h-[44px] mt-1 py-2.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Set as Active Goal</span>
                </button>
              </div>

              {/* Presets List */}
              <div className="space-y-2.5 pt-3 border-t border-[#C5D8EC]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#36506B]">
                  Explore Curated Challenges
                </div>

                <div className="space-y-2">
                  {FREEPLAY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.statement)}
                      className="w-full p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] hover:border-[#0369A1] hover:bg-[#F0F7FF] text-left transition active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-[#0C1B2E]">{preset.title}</span>
                        <span className="text-xs font-mono font-bold text-[#0369A1] shrink-0">Load →</span>
                      </div>
                      <div className="font-mono text-xs text-[#334155] font-semibold truncate mt-1">
                        {preset.statement}
                      </div>
                      <div className="text-xs text-[#36506B] mt-1 leading-snug">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Custom Theorems Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0C1B2E]/45 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#F4F8FC] border border-[#A8C4E0] rounded-3xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden">
            <div className="px-4 py-3.5 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-extrabold text-[#0C1B2E]">My Proved Theorems ({savedTheorems.length})</h3>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-xl text-[#36506B] hover:text-[#0C1B2E] hover:bg-[#D5E6F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
              {savedTheorems.map((thm) => (
                <div
                  key={thm.id}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-[#0C1B2E] truncate">{thm.name}</div>
                    <div className="text-xs font-mono font-semibold text-[#334155] truncate mt-0.5">
                      {thm.statement}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const p = parseTheoremDeclaration(thm.statement);
                        const preCheck = verifyProof(
                          thm.proofCode,
                          [{ id: 'freeplay_check', hypotheses: p.hypotheses, target: p.target }],
                          extraLemmas
                        );
                        setCompletedCelebrated(preCheck.isComplete);
                        setCurrentStatement(thm.statement);
                        setProofCode(thm.proofCode);
                        setIsSaved(false);
                        setIsLibraryOpen(false);
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] text-xs font-bold cursor-pointer"
                    >
                      Load
                    </button>

                    {onDeleteCustomTheorem && (
                      <button
                        onClick={() => onDeleteCustomTheorem(thm.id)}
                        className="min-w-[38px] min-h-[38px] rounded-xl text-[#526D88] hover:text-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center cursor-pointer"
                        title="Delete theorem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
