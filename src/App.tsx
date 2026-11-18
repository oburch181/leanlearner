/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORLDS } from './data/worlds';
import { LevelDef, WorldDef, UserProgress, FreeplayTheorem } from './types/lean';
import { AndroidFrame } from './components/AndroidFrame';
import { WorldMap } from './components/WorldMap';
import { LevelBriefingView } from './components/LevelBriefingView';
import { LevelView } from './components/LevelView';
import { FreeplayView } from './components/FreeplayView';
import { InventoryModal } from './components/InventoryModal';
import { HintsModal } from './components/HintsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { Header } from './components/Header';
import { SettingsView } from './components/SettingsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  configureNativeAndroidUI,
  isStandaloneOrNative,
  registerAndroidBackHandler,
} from './utils/nativeAndroid';

const STORAGE_KEY = 'nng4_android_progress_v1';

const getDefaultProgress = (): UserProgress => ({
  completedLevels: {},
  levelCodes: {},
  soundEnabled: true,
  hapticsEnabled: true,
  mobileFrameMode: typeof window !== 'undefined' ? window.innerWidth > 640 : true,
  savedFreeplayTheorems: [],
  unlockAllTutorials: false,
  unlockAllTactics: false,
});

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const defaults = getDefaultProgress();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...defaults, ...JSON.parse(saved) };
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return defaults;
  });

  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [activeWorld, setActiveWorld] = useState<WorldDef | null>(null);
  const [levelViewMode, setLevelViewMode] = useState<'briefing' | 'proof'>('briefing');
  const [isFreeplayMode, setIsFreeplayMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [externalCodeVersion, setExternalCodeVersion] = useState<number>(0);

  // Active editor insert hook (so Codex can insert lemmas into LevelView or FreeplayView)
  const activeInsertHandlerRef = useRef<((text: string) => void) | null>(null);
  const handleRegisterInsertHandler = useCallback((handler: ((text: string) => void) | null) => {
    activeInsertHandlerRef.current = handler;
  }, []);

  // Modals
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const isStandalone = isStandaloneOrNative();

  const canInsertIntoEditor =
    !isSettingsOpen && (isFreeplayMode || (!!activeLevel && levelViewMode === 'proof'));

  // Configure Android StatusBar when running inside Capacitor APK
  useEffect(() => {
    configureNativeAndroidUI();
  }, []);

  // Handle Android hardware Back button cleanly
  useEffect(() => {
    return registerAndroidBackHandler(() => {
      if (isCodexOpen) {
        setIsCodexOpen(false);
        return true;
      }
      if (isHintsOpen) {
        setIsHintsOpen(false);
        return true;
      }
      if (isAndroidModalOpen) {
        setIsAndroidModalOpen(false);
        return true;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      }
      if (isFreeplayMode) {
        setIsFreeplayMode(false);
        return true;
      }
      if (activeLevel) {
        if (levelViewMode === 'proof') {
          setLevelViewMode('briefing');
        } else {
          setActiveLevel(null);
          setActiveWorld(null);
        }
        return true;
      }
      return false;
    });
  }, [
    isCodexOpen,
    isHintsOpen,
    isAndroidModalOpen,
    isSettingsOpen,
    isFreeplayMode,
    activeLevel,
    levelViewMode,
  ]);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Compute unlocked lemmas list
  const unlockedLemmas = React.useMemo(() => {
    const list = new Set<string>([
      'add_zero',
      'add_succ',
      'one_eq_succ_zero',
      'two_eq_succ_one',
      'three_eq_succ_two',
      'four_eq_succ_three',
    ]);

    WORLDS.forEach((world) => {
      world.levels.forEach((level) => {
        if (progress.completedLevels[level.id]) {
          list.add(level.theoremName);
          level.newTheoremsProvided?.forEach((th) => list.add(th.name));
        }
      });
    });

    return Array.from(list);
  }, [progress.completedLevels]);

  const handleSelectLevel = (level: LevelDef) => {
    const world = WORLDS.find((w) => w.id === level.worldId) || WORLDS[0];
    setActiveWorld(world);
    setActiveLevel(level);
    setIsFreeplayMode(false);
    setLevelViewMode('briefing');
  };

  const handleLevelCompleted = (levelId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedLevels: {
        ...prev.completedLevels,
        [levelId]: true,
      },
    }));
  };

  const handleSaveCode = (levelId: string, code: string) => {
    setProgress((prev) => ({
      ...prev,
      levelCodes: {
        ...prev.levelCodes,
        [levelId]: code,
      },
    }));
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleToggleFrameMode = () => {
    setProgress((prev) => ({
      ...prev,
      mobileFrameMode: !prev.mobileFrameMode,
    }));
  };

  const handleSaveCustomTheorem = (newThm: FreeplayTheorem) => {
    setProgress((prev) => {
      const existing = prev.savedFreeplayTheorems || [];
      const filtered = existing.filter((t) => t.name !== newThm.name);
      return {
        ...prev,
        savedFreeplayTheorems: [newThm, ...filtered],
      };
    });
  };

  const handleDeleteCustomTheorem = (thmId: string) => {
    setProgress((prev) => ({
      ...prev,
      savedFreeplayTheorems: (prev.savedFreeplayTheorems || []).filter((t) => t.id !== thmId),
    }));
  };

  const handleResetProgress = () => {
    setProgress((prev) => ({
      ...prev,
      completedLevels: {},
      levelCodes: {},
      savedFreeplayTheorems: [],
    }));
  };

  // Next and Previous Level navigation logic
  const currentLevelIndex = activeWorld && activeLevel
    ? activeWorld.levels.findIndex((l) => l.id === activeLevel.id)
    : -1;

  const hasNextLevel = activeWorld ? currentLevelIndex >= 0 && currentLevelIndex < activeWorld.levels.length - 1 : false;
  const hasPrevLevel = currentLevelIndex > 0;

  const handleNextLevel = () => {
    if (!activeWorld || !hasNextLevel) return;
    const nextLvl = activeWorld.levels[currentLevelIndex + 1];
    setActiveLevel(nextLvl);
    setLevelViewMode('briefing');
  };

  const handlePrevLevel = () => {
    if (!activeWorld || !hasPrevLevel) return;
    const prevLvl = activeWorld.levels[currentLevelIndex - 1];
    setActiveLevel(prevLvl);
    setLevelViewMode('briefing');
  };

  return (
    <AndroidFrame
      frameMode={progress.mobileFrameMode}
      onToggleFrameMode={handleToggleFrameMode}
      isNativeOrStandalone={isStandalone}
    >
      <OfflineIndicator />
      {isSettingsOpen ? (
        <SettingsView
          progress={progress}
          onUpdateProgress={setProgress}
          onBack={() => setIsSettingsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      ) : isFreeplayMode ? (
        <FreeplayView
          onBackToHome={() => setIsFreeplayMode(false)}
          onOpenCodex={() => setIsCodexOpen(true)}
          onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          soundEnabled={progress.soundEnabled}
          hapticsEnabled={progress.hapticsEnabled}
          onToggleSound={handleToggleSound}
          unlockedLemmas={unlockedLemmas}
          savedTheorems={progress.savedFreeplayTheorems}
          onSaveCustomTheorem={handleSaveCustomTheorem}
          onDeleteCustomTheorem={handleDeleteCustomTheorem}
          onRegisterInsertHandler={handleRegisterInsertHandler}
        />
      ) : activeLevel && activeWorld ? (
        levelViewMode === 'briefing' ? (
          <LevelBriefingView
            level={activeLevel}
            world={activeWorld}
            isCompleted={!!progress.completedLevels[activeLevel.id]}
            onStartProof={() => setLevelViewMode('proof')}
            onBackToMap={() => {
              setActiveLevel(null);
              setActiveWorld(null);
            }}
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenHints={() => setIsHintsOpen(true)}
            hasNextLevel={hasNextLevel}
            hasPrevLevel={hasPrevLevel}
            onNextLevel={handleNextLevel}
            onPrevLevel={handlePrevLevel}
          />
        ) : (
          <LevelView
            level={activeLevel}
            world={activeWorld}
            onBackToMap={() => {
              setActiveLevel(null);
              setActiveWorld(null);
            }}
            onOpenBriefing={() => setLevelViewMode('briefing')}
            onNextLevel={handleNextLevel}
            onPrevLevel={handlePrevLevel}
            hasNextLevel={hasNextLevel}
            hasPrevLevel={hasPrevLevel}
            onLevelCompleted={handleLevelCompleted}
            unlockedLemmas={unlockedLemmas}
            savedCode={progress.levelCodes[activeLevel.id]}
            onSaveCode={handleSaveCode}
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenHints={() => setIsHintsOpen(true)}
            onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            soundEnabled={progress.soundEnabled}
            hapticsEnabled={progress.hapticsEnabled}
            onToggleSound={handleToggleSound}
            unlockAllTactics={progress.unlockAllTactics}
            externalCodeVersion={externalCodeVersion}
            onRegisterInsertHandler={handleRegisterInsertHandler}
          />
        )
      ) : (
        <div className="w-full flex-1 flex flex-col bg-[#F4F8FC] overflow-hidden">
          <Header
            title="Natural Number Game"
            subtitle="Lean 4 • Peano Arithmetic"
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
            onOpenFreeplay={() => setIsFreeplayMode(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            soundEnabled={progress.soundEnabled}
            onToggleSound={handleToggleSound}
            unlockedCount={unlockedLemmas.length}
          />
          <WorldMap
            completedLevels={progress.completedLevels}
            onSelectLevel={handleSelectLevel}
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
            onOpenFreeplay={() => setIsFreeplayMode(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            unlockAllTutorials={progress.unlockAllTutorials}
          />
        </div>
      )}

      {/* Theorem Codex Modal */}
      <InventoryModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        unlockedLemmaIds={unlockedLemmas}
        canInsert={canInsertIntoEditor}
        onInsertLemma={(text) => {
          activeInsertHandlerRef.current?.(`${text}\n`);
        }}
      />

      {/* Hints Modal */}
      {activeLevel && (
        <HintsModal
          isOpen={isHintsOpen}
          onClose={() => setIsHintsOpen(false)}
          hints={activeLevel.hints}
          solution={activeLevel.solution}
          onApplySolution={(sol) => {
            if (activeLevel) {
              handleSaveCode(activeLevel.id, sol);
              setExternalCodeVersion((v) => v + 1);
              setLevelViewMode('proof');
            }
          }}
        />
      )}

      {/* Android Install & APK Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </AndroidFrame>
  );
}
