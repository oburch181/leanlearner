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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0C1B2E]/45 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#F4F8FC] border border-[#A8C4E0] rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#0369A1]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0C1B2E]">Theorem Codex</h3>
              <p className="text-xs text-[#36506B]">
                {unlockedLemmaIds.length} lemmas &amp; axioms unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#36506B] hover:text-[#0C1B2E] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-[#E6F0FA]/60 border-b border-[#C5D8EC]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#526D88] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search theorems, axioms, rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#A8C4E0] rounded-xl pl-10 pr-3.5 py-2 text-sm text-[#0C1B2E] placeholder-[#6E87A0] outline-none focus:border-[#0369A1]"
            />
          </div>
        </div>

        {/* Codex List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#36506B]">
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
                  className={`p-3.5 rounded-2xl border transition flex flex-col gap-2 ${
                    isUnlocked
                      ? 'bg-[#FFFFFF] border-[#C5D8EC] shadow-xs'
                      : 'bg-[#E6F0FA]/60 border-[#C5D8EC]/70 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-extrabold text-sm text-[#0369A1] truncate">
                        {lemma.name}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[#475569] text-xs font-bold flex items-center gap-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[#526D88] text-xs font-semibold shrink-0">
                          · Locked
                        </span>
                      )}
                    </div>

                    {isUnlocked && canInsert && (
                      <button
                        onClick={() => {
                          onInsertLemma(`rw [${lemma.name}]`);
                          onClose();
                        }}
                        className="min-h-[34px] px-3 py-1 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert</span>
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-sm font-semibold text-[#0C1B2E] bg-[#EDF4FC] px-3 py-1.5 rounded-xl border border-[#C5D8EC] overflow-x-auto">
                    {lemma.lhs} = {lemma.rhs}
                  </div>

                  <p className="text-xs text-[#36506B] leading-relaxed">{lemma.description}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
