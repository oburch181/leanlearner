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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#2C2115]/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#EDE2C6] border border-[#BDA67C] rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#E3D4B3] border-b border-[#CEBA92] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFE0BA] border border-[#C9A96E] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#8B4F0E]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C2115]">Theorem Codex</h3>
              <p className="text-xs text-[#5C4A36]">
                {unlockedLemmaIds.length} lemmas &amp; axioms unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#5C4A36] hover:text-[#2C2115] hover:bg-[#D5C39C] transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-[#E3D4B3]/65 border-b border-[#CEBA92]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7D6952] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search theorems, axioms, rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5EEDB] border border-[#BDA67C] rounded-xl pl-10 pr-3.5 py-2 text-sm text-[#2C2115] placeholder-[#7D6952] outline-none focus:border-[#9A5B13]"
            />
          </div>
        </div>

        {/* Codex List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#5C4A36]">
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
                      ? 'bg-[#F5EEDB] border-[#CEBA92] shadow-xs'
                      : 'bg-[#E3D4B3]/65 border-[#CEBA92]/70 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-extrabold text-sm text-[#8B4F0E] truncate">
                        {lemma.name}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[#5F5343] text-xs font-bold flex items-center gap-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[#7D6952] text-xs font-semibold shrink-0">
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
                        className="min-h-[34px] px-3 py-1 rounded-xl bg-[#9A5B13] hover:bg-[#7C480D] text-[#FDF8EC] text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert</span>
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-sm font-semibold text-[#2C2115] bg-[#E9DEC2] px-3 py-1.5 rounded-xl border border-[#CEBA92] overflow-x-auto">
                    {lemma.lhs} = {lemma.rhs}
                  </div>

                  <p className="text-xs text-[#5C4A36] leading-relaxed">{lemma.description}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
