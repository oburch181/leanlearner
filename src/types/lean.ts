export type WorldId = 
  | 'tutorial'
  | 'addition'
  | 'multiplication'
  | 'power'
  | 'implication'
  | 'inequality';

export interface Hypothesis {
  id: string;
  name: string;
  type: string; // e.g. "x = y" or "n : ℕ" or "hd : 0 + d = d"
  isVariable?: boolean;
}

export interface GoalState {
  id: string;
  hypotheses: Hypothesis[];
  target: string; // e.g. "0 + succ d = succ d"
  name?: string; // e.g. "Base Case (zero)" or "Inductive Step (succ)"
}

export interface TheoremItem {
  id: string;
  name: string;
  statement: string;
  description: string;
  worldId: WorldId;
  isAxiom?: boolean;
}

export interface LevelHint {
  level: 1 | 2 | 3;
  title: string;
  text: string;
  suggestedTactic?: string;
}

export interface LevelDef {
  id: string;
  number: number;
  worldId: WorldId;
  name: string;
  theoremName: string;
  statement: string; // Lean statement: "theorem zero_add (n : ℕ) : 0 + n = n"
  initialTarget: string;
  initialHypotheses: Hypothesis[];
  story: string;
  explanation: string;
  unlockedTheoremsNeeded: string[];
  newTheoremsProvided: TheoremItem[];
  starterCode?: string;
  solution: string;
  hints: LevelHint[];
}

export interface WorldDef {
  id: WorldId;
  number: number;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  levels: LevelDef[];
}

export interface FreeplayTheorem {
  id: string;
  name: string;
  statement: string;
  target: string;
  hypotheses: Hypothesis[];
  proofCode: string;
  isCustom?: boolean;
}

export interface UserProgress {
  completedLevels: Record<string, boolean>; // levelId -> boolean
  levelCodes: Record<string, string>; // levelId -> user code draft
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  mobileFrameMode: boolean; // whether to show Android Phone Frame wrapper on wide screens
  savedFreeplayTheorems?: FreeplayTheorem[];
  unlockAllTutorials?: boolean; // When true, all worlds and levels are unlocked
  unlockAllTactics?: boolean; // When true, all tactics are unlocked from level 1
}
