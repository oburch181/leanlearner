import React, { useRef, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import { RotateCcw, Keyboard, Smartphone } from 'lucide-react';

interface LeanEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onReset: () => void;
  errorLine?: number;
  useSystemKeyboard?: boolean;
  onToggleSystemKeyboard?: () => void;
}

export interface LeanEditorHandle {
  insertText: (text: string, cursorOffsetFromEnd?: number) => void;
  backspace: () => void;
  insertNewline: () => void;
  moveCursor: (direction: 'left' | 'right') => void;
}

export const LeanEditor = forwardRef<LeanEditorHandle, LeanEditorProps>(
  (
    {
      code,
      onChange,
      onReset,
      errorLine,
      useSystemKeyboard = false,
      onToggleSystemKeyboard,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

    useLayoutEffect(() => {
      const textarea = textareaRef.current;
      const pending = pendingSelectionRef.current;
      if (textarea && pending) {
        pendingSelectionRef.current = null;
        textarea.focus({ preventScroll: true });
        const clampedStart = Math.min(pending.start, textarea.value.length);
        const clampedEnd = Math.min(pending.end, textarea.value.length);
        textarea.setSelectionRange(clampedStart, clampedEnd);
      }
    }, [code]);

    useImperativeHandle(ref, () => ({
      insertText: (text: string, cursorOffsetFromEnd: number = 0) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentVal = textarea.value;
        const start = textarea.selectionStart ?? currentVal.length;
        const end = textarea.selectionEnd ?? currentVal.length;
        const newCode = currentVal.substring(0, start) + text + currentVal.substring(end);
        const newCursorPos = Math.max(0, start + text.length + cursorOffsetFromEnd);

        pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
        textarea.value = newCode;
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        onChange(newCode);
      },
      backspace: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentVal = textarea.value;
        const start = textarea.selectionStart ?? currentVal.length;
        const end = textarea.selectionEnd ?? currentVal.length;

        let newCode = currentVal;
        let newCursorPos = start;

        if (start === end) {
          if (start > 0) {
            newCode = currentVal.substring(0, start - 1) + currentVal.substring(end);
            newCursorPos = start - 1;
          } else {
            return;
          }
        } else {
          newCode = currentVal.substring(0, start) + currentVal.substring(end);
          newCursorPos = start;
        }

        pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
        textarea.value = newCode;
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        onChange(newCode);
      },
      insertNewline: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentVal = textarea.value;
        const start = textarea.selectionStart ?? currentVal.length;
        const end = textarea.selectionEnd ?? currentVal.length;
        const newCode = currentVal.substring(0, start) + '\n' + currentVal.substring(end);

        pendingSelectionRef.current = { start: start + 1, end: start + 1 };
        textarea.value = newCode;
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(start + 1, start + 1);
        onChange(newCode);
      },
      moveCursor: (direction: 'left' | 'right') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentPos = textarea.selectionStart ?? 0;
        const targetPos =
          direction === 'left'
            ? Math.max(0, currentPos - 1)
            : Math.min(textarea.value.length, currentPos + 1);

        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(targetPos, targetPos);
      },
    }));

    const lines = code.split('\n');

    return (
      <div className="w-full flex-1 flex flex-col bg-[#F5EEDB] border border-[#CEBA92] rounded-2xl overflow-hidden shadow-xs relative">
        {/* Editor Top Bar */}
        <div className="h-9 px-3 bg-[#E3D4B3] border-b border-[#CEBA92] flex items-center justify-between text-xs text-[#5C4A36] select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-[#8B4F0E]">proof.lean</span>
            <span className="text-[#7D6952]">·</span>
            <span className="text-xs font-medium text-[#5C4A36] truncate">Lean 4 Tactic Mode</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleSystemKeyboard && (
              <button
                onClick={onToggleSystemKeyboard}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#2C2115] transition px-2.5 py-1 rounded-lg bg-[#DAC8A2] hover:bg-[#D0BC92] border border-[#BDA67C] cursor-pointer"
                title={
                  useSystemKeyboard
                    ? 'Switch to Custom Lean Keyboard'
                    : 'Enable standard Android keyboard'
                }
              >
                {useSystemKeyboard ? (
                  <>
                    <Keyboard className="w-3.5 h-3.5 text-[#5F5343]" />
                    <span className="text-[#5F5343]">System KB</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-[#8B4F0E]" />
                    <span>Custom KB</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-semibold text-[#5C4A36] hover:text-[#2C2115] transition active:scale-95 px-2 py-1 rounded-lg hover:bg-[#DAC8A2] cursor-pointer"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Code Area with Line Numbers */}
        <div className="flex-1 relative flex font-mono text-sm leading-6 overflow-hidden">
          {/* Line Numbers column */}
          <div className="w-10 bg-[#E9DEC2] py-2.5 border-r border-[#D8C7A4] select-none text-right pr-2.5 text-[#7D6952] font-mono text-xs shrink-0 tabular-nums">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`h-6 leading-6 ${
                  errorLine === i + 1 ? 'text-[#7C261D] font-extrabold bg-[#F3DDD5] rounded-l px-1' : ''
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Interactive Textarea with inputMode control */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            inputMode={useSystemKeyboard ? 'text' : 'none'}
            className="flex-1 w-full h-full bg-transparent px-3 py-2.5 text-[#2C2115] font-medium resize-none outline-none font-mono text-sm leading-6 focus:ring-0 selection:bg-[#9A5B13]/20 placeholder:text-[#7D6952]"
            placeholder="Type tactics here..."
          />
        </div>
      </div>
    );
  }
);

LeanEditor.displayName = 'LeanEditor';
