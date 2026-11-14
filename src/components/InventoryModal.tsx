import React, { useState } from 'react';
import { X, BookOpen, Search, Check, Plus, ShieldCheck } from 'lucide-react';
import { KNOWN_LEMMAS } from '../engine/leanEngine';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedLemmaIds: string[];
  onInsertLemma: (tacticText: string) => void;
  canInsert?: boolean;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  unlockedLemmaIds,
  onInsertLemma,
  canInsert = true,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const allEntries = Object.values(KNOWN_LEMMAS);
  const filtered = allEntries.filter(
    (lemma) =>
      lemma.name.toLowerCase().includes(search.toLowerCase()) ||
      lemma.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Theorem Codex</h3>
              <p className="text-[10px] text-slate-400">
                {unlockedLemmaIds.length} lemmas & axioms unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-slate-900 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search theorems, axioms, rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Codex List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No theorems match your search.
            </div>
          ) : (
            filtered.map((lemma) => {
              const isUnlocked =
                unlockedLemmaIds.includes(lemma.name) ||
                ['add_zero', 'add_succ', 'one_eq_succ_zero', 'two_eq_succ_one'].includes(
                  lemma.name
                );

              return (
                <div
                  key={lemma.name}
                  className={`p-2.5 rounded-xl border transition flex flex-col gap-1.5 ${
                    isUnlocked
                      ? 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/50'
                      : 'bg-slate-950/30 border-slate-900/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-indigo-300">
                        {lemma.name}
                      </span>
                      {isUnlocked ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px]">
                          Locked
                        </span>
                      )}
                    </div>

                    {isUnlocked && canInsert && (
                      <button
                        onClick={() => {
                          onInsertLemma(`rw [${lemma.name}]`);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-medium flex items-center gap-1 transition active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert</span>
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-[11px] text-slate-200 bg-slate-900/90 px-2 py-1 rounded border border-slate-800/60">
                    {lemma.lhs} = {lemma.rhs}
                  </div>

                  <p className="text-[10px] text-slate-400">{lemma.description}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
