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
        colors: ['#818cf8', '#38bdf8', '#34d399', '#f59e0b', '#ec4899'],
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
    <div className="w-full flex-1 flex flex-col bg-slate-950 overflow-hidden">
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
      <div className="flex-1 flex flex-col p-2.5 space-y-2 overflow-y-auto no-scrollbar">
        {/* Active Theorem Card with Edit & Presets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between shadow-sm shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Target Theorem</span>
            </div>
            <div className="font-mono text-xs text-emerald-300 font-bold truncate mt-0.5">
              {currentStatement}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setInputStatement(currentStatement);
                setIsEditModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition active:scale-95"
              title="Edit theorem or choose preset"
            >
              <Pencil className="w-3 h-3 text-indigo-400" />
              <span>New / Presets</span>
            </button>

            {savedTheorems.length > 0 && (
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Saved custom theorems"
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
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
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/60 to-slate-900 border border-emerald-500/50 flex items-center justify-between shadow-lg animate-fade-in shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-emerald-300 truncate">Proof Formally Verified!</h4>
                <p className="text-[10px] text-slate-300">Closed using Lean 4 Peano axioms.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={handleSaveTheorem}
                disabled={isSaved}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookMarked className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved!' : 'Save Theorem'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Copy Lean 4 Source"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Lean Code Editor */}
        <div className="flex-1 min-h-[140px] flex flex-col">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Theorem Sandbox</h3>
                  <p className="text-[10px] text-slate-400">Configure or choose any mathematical identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Custom Header Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Custom Lean 4 Theorem Declaration
                </label>
                <input
                  type="text"
                  value={inputStatement}
                  onChange={(e) => setInputStatement(e.target.value)}
                  placeholder="theorem my_id (a b : ℕ) : a + b = b + a"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">
                  You can type a full Lean statement (e.g. <code>theorem test (x y : ℕ) : x + y = y + x</code>) or a plain equation (e.g. <code>a + 0 = a</code>).
                </p>

                <button
                  onClick={() => {
                    handleApplyPreset(inputStatement.trim() || 'example (a : ℕ) : a + 0 = a');
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Set as Active Goal</span>
                </button>
              </div>

              {/* Presets List */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explore Curated Challenges
                </div>

                <div className="space-y-1.5">
                  {FREEPLAY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.statement)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 text-left transition active:scale-98"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{preset.title}</span>
                        <span className="text-[10px] font-mono text-indigo-400">Load →</span>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-300 truncate mt-0.5">
                        {preset.statement}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">My Proved Theorems ({savedTheorems.length})</h3>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {savedTheorems.map((thm) => (
                <div
                  key={thm.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{thm.name}</div>
                    <div className="text-[10px] font-mono text-emerald-300 truncate mt-0.5">
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
                      className="px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium"
                    >
                      Load
                    </button>

                    {onDeleteCustomTheorem && (
                      <button
                        onClick={() => onDeleteCustomTheorem(thm.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                        title="Delete theorem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
