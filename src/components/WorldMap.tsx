import React, { useState, useMemo } from 'react';
import { WORLDS } from '../data/worlds';
import { WorldDef, LevelDef } from '../types/lean';
import { 
  GraduationCap, 
  Plus, 
  X as MulIcon, 
  Zap, 
  ArrowRight, 
  Scale, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
  Settings,
  Unlock
} from 'lucide-react';

interface WorldMapProps {
  completedLevels: Record<string, boolean>;
  onSelectLevel: (level: LevelDef) => void;
  onOpenCodex: () => void;
  onOpenAndroidInstall: () => void;
  onOpenFreeplay?: () => void;
  onOpenSettings?: () => void;
  unlockAllTutorials?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  completedLevels,
  onSelectLevel,
  onOpenFreeplay,
  onOpenSettings,
  unlockAllTutorials = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Plus':
        return <Plus className="w-4 h-4" />;
      case 'X':
        return <MulIcon className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'ArrowRight':
        return <ArrowRight className="w-4 h-4" />;
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const totalLevels = WORLDS.reduce((acc, w) => acc + w.levels.length, 0);
  const totalCompleted = Object.values(completedLevels).filter(Boolean).length;
  const progressPercent = Math.round((totalCompleted / totalLevels) * 100);

  // Find next uncompleted level to offer quick resume
  const nextLevelToPlay = useMemo(() => {
    for (const world of WORLDS) {
      for (const lvl of world.levels) {
        if (!completedLevels[lvl.id]) {
          return { level: lvl, world };
        }
      }
    }
    return { level: WORLDS[0].levels[0], world: WORLDS[0] };
  }, [completedLevels]);

  // Default expanded world: world of the next uncompleted level
  const [expandedWorldId, setExpandedWorldId] = useState<string>(
    nextLevelToPlay.world.id || 'tutorial'
  );

  const toggleWorld = (worldId: string) => {
    setExpandedWorldId((prev) => (prev === worldId ? '' : worldId));
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">
      {/* Sleek Minimal Progress Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">Progress</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-300 font-mono font-medium">
              {totalCompleted} of {totalLevels} Proofs
            </span>
          </div>
          <span className="font-mono text-slate-400 text-[11px] font-semibold">
            {progressPercent}%
          </span>
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        {/* Quick Resume Button */}
        {nextLevelToPlay && (
          <button
            onClick={() => onSelectLevel(nextLevelToPlay.level)}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-400/50 flex items-center justify-between text-left transition active:scale-98"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">
                  Continue Proof
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {nextLevelToPlay.world.name} • Level {nextLevelToPlay.level.number}: {nextLevelToPlay.level.name}
                </div>
              </div>
            </div>

            <span className="text-xs text-indigo-300 font-semibold shrink-0 ml-2">
              Play →
            </span>
          </button>
        )}

        {/* Freeplay Sandbox Button */}
        {onOpenFreeplay && (
          <button
            onClick={onOpenFreeplay}
            className="w-full mt-1.5 py-2 px-3 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:bg-purple-900/40 hover:border-purple-400/50 flex items-center justify-between text-left transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
                  Unguided Mode
                </div>
                <div className="text-xs font-bold text-white truncate">
                  Freeplay Proof Sandbox
                </div>
              </div>
            </div>

            <span className="text-xs text-purple-300 font-semibold shrink-0 ml-2">
              Open →
            </span>
          </button>
        )}
      </div>

      {/* Worlds Accordion List */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
          Worlds & Theorems
        </div>

        {WORLDS.map((world, wIdx) => {
          const completedInWorld = world.levels.filter(
            (lvl) => completedLevels[lvl.id]
          ).length;
          const isWorldMastered = completedInWorld === world.levels.length;
          const isUnlocked =
            unlockAllTutorials ||
            wIdx === 0 ||
            Object.values(completedLevels).filter(Boolean).length >= Math.max(1, wIdx * 2);
          const isExpanded = expandedWorldId === world.id && isUnlocked;

          return (
            <div
              key={world.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900/80 opacity-50'
              }`}
            >
              {/* World Header Card */}
              <button
                disabled={!isUnlocked}
                onClick={() => toggleWorld(world.id)}
                className={`w-full p-3 flex items-center justify-between text-left transition ${
                  isUnlocked ? 'hover:bg-slate-800/40 cursor-pointer active:scale-99' : 'cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${world.color}15`,
                      borderColor: `${world.color}40`,
                      color: world.color,
                    }}
                  >
                    {isUnlocked ? getIcon(world.icon) : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white truncate">
                        {world.name}
                      </h3>
                      {isWorldMastered && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {world.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {completedInWorld}/{world.levels.length}
                  </span>
                  {isUnlocked && (
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Levels List when Expanded */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-800/60 bg-slate-950/30 animate-fade-in">
                  {world.levels.map((lvl) => {
                    const isDone = completedLevels[lvl.id];
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => onSelectLevel(lvl)}
                        className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition group active:scale-98 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600/60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0 ${
                              isDone
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : lvl.number}
                          </div>

                          <div className="truncate">
                            <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                              {lvl.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {lvl.initialTarget}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-500 group-hover:text-indigo-300 font-medium shrink-0 ml-2">
                          {isDone ? 'Review' : 'Play'} →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Settings Quick Bar */}
      {onOpenSettings && (
        <div className="pt-1">
          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 flex items-center justify-between text-left transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-300 font-medium">Game Settings</span>
            </div>
            <div className="flex items-center gap-1.5">
              {unlockAllTutorials ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px]">
                  All Tutorials Unlocked
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  Progressive Unlocking
                </span>
              )}
              <span className="text-xs text-slate-400">→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
