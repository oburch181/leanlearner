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
        return <GraduationCap className="w-5 h-5" />;
      case 'Plus':
        return <Plus className="w-5 h-5" />;
      case 'X':
        return <MulIcon className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'ArrowRight':
        return <ArrowRight className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
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
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#F4F8FC]">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {/* Progress & Quick Actions Card */}
        <div className="bg-[#FFFFFF] border border-[#C5D8EC] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0C1B2E]">Journey Progress</span>
              <span className="text-[#6E87A0]">·</span>
              <span className="text-[#0369A1] font-mono font-semibold">
                {totalCompleted} of {totalLevels} Proofs
              </span>
            </div>
            <span className="font-mono text-[#36506B] text-sm font-bold">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-[#DCE9F7] overflow-hidden border border-[#C5D8EC]/70">
            <div
              className="h-full bg-gradient-to-r from-[#0369A1] to-[#38BDF8] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>

          {/* Quick Resume Button */}
          {nextLevelToPlay && (
            <button
              onClick={() => onSelectLevel(nextLevelToPlay.level)}
              className="w-full min-h-[52px] py-2.5 px-3.5 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] hover:bg-[#BAE6FD] hover:border-[#38BDF8] flex items-center justify-between text-left transition active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0 shadow-xs">
                  <Play className="w-4 h-4 fill-[#FFFFFF] text-[#FFFFFF] ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#0369A1] font-bold uppercase tracking-wider">
                    Continue Proof
                  </div>
                  <div className="text-sm font-bold text-[#0C1B2E] truncate">
                    {nextLevelToPlay.world.name} · Lvl {nextLevelToPlay.level.number}: {nextLevelToPlay.level.name}
                  </div>
                </div>
              </div>

              <span className="text-sm text-[#0369A1] font-bold shrink-0 ml-2">
                Play →
              </span>
            </button>
          )}

          {/* Freeplay Sandbox Button */}
          {onOpenFreeplay && (
            <button
              onClick={onOpenFreeplay}
              className="w-full min-h-[52px] py-2.5 px-3.5 rounded-xl bg-[#EAF2FF] border border-[#93C5FD] hover:bg-[#DBEAFE] hover:border-[#60A5FA] flex items-center justify-between text-left transition active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#1D4ED8] font-bold uppercase tracking-wider">
                    Unguided Mode
                  </div>
                  <div className="text-sm font-bold text-[#0C1B2E] truncate">
                    Freeplay Proof Sandbox
                  </div>
                </div>
              </div>

              <span className="text-sm text-[#1D4ED8] font-bold shrink-0 ml-2">
                Open →
              </span>
            </button>
          )}
        </div>

        {/* Worlds Accordion List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#36506B] px-1">
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
                    ? 'bg-[#FFFFFF] border-[#C5D8EC] shadow-xs'
                    : 'bg-[#E6F0FA]/60 border-[#C5D8EC]/70 opacity-65'
                }`}
              >
                {/* World Header Card */}
                <button
                  disabled={!isUnlocked}
                  onClick={() => toggleWorld(world.id)}
                  className={`w-full min-h-[64px] p-3.5 flex items-center justify-between text-left transition ${
                    isUnlocked ? 'hover:bg-[#F0F7FF] cursor-pointer active:scale-[0.995]' : 'cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${world.color}16`,
                        borderColor: `${world.color}45`,
                        color: world.color,
                      }}
                    >
                      {isUnlocked ? getIcon(world.icon) : <Lock className="w-4 h-4 text-[#526D88]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#0C1B2E] truncate">
                          {world.name}
                        </h3>
                        {isWorldMastered && (
                          <span className="text-[#475569] text-xs font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#36506B] truncate">
                        {world.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-mono font-bold text-[#36506B]">
                      {completedInWorld}/{world.levels.length}
                    </span>
                    {isUnlocked && (
                      <div className="text-[#36506B]">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Levels List when Expanded */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 space-y-2 border-t border-[#D6E5F4] bg-[#F4F8FC]/70 animate-fade-in">
                    {world.levels.map((lvl) => {
                      const isDone = completedLevels[lvl.id];
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => onSelectLevel(lvl)}
                          className={`w-full min-h-[56px] p-3 rounded-xl border text-left flex items-center justify-between transition group active:scale-[0.99] cursor-pointer ${
                            isDone
                              ? 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#94A3B8]'
                              : 'bg-[#FFFFFF] border-[#C5D8EC] hover:border-[#0369A1] hover:bg-[#F0F7FF]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono shrink-0 ${
                                isDone
                                  ? 'bg-[#475569] text-[#FFFFFF]'
                                  : 'bg-[#E6F0FA] text-[#0C1B2E] border border-[#A8C4E0]'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : lvl.number}
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#0C1B2E] truncate">
                                {lvl.name}
                              </div>
                              <div className="text-xs font-mono text-[#36506B] truncate mt-0.5">
                                {lvl.initialTarget}
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-[#0369A1] shrink-0 ml-2">
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
          <div className="pt-1 pb-2">
            <button
              onClick={onOpenSettings}
              className="w-full min-h-[52px] py-3 px-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] hover:bg-[#F0F7FF] flex items-center justify-between text-left transition active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-[#36506B]" />
                <span className="text-sm text-[#0C1B2E] font-bold">Game Settings</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={unlockAllTutorials ? 'text-[#0284C7] font-bold' : 'text-[#36506B] font-medium'}>
                  {unlockAllTutorials ? 'All Tutorials Unlocked' : 'Progressive Unlocking'}
                </span>
                <span className="text-sm font-bold text-[#36506B]">→</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
