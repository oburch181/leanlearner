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
      <div className="w-full flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner relative">
        {/* Editor Top Bar */}
        <div className="h-7 px-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-400">proof.lean</span>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] text-slate-400">Lean 4 Tactic Mode</span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSystemKeyboard && (
              <button
                onClick={onToggleSystemKeyboard}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                title={
                  useSystemKeyboard
                    ? 'Switch to Custom Lean Keyboard'
                    : 'Enable standard Android keyboard'
                }
              >
                {useSystemKeyboard ? (
                  <>
                    <Keyboard className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">System KB</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3 h-3 text-indigo-400" />
                    <span>Custom KB</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition active:scale-95 px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Code Area with Line Numbers */}
        <div className="flex-1 relative flex font-mono text-xs leading-relaxed overflow-hidden">
          {/* Line Numbers column */}
          <div className="w-9 bg-slate-950/50 py-2 border-r border-slate-800/40 select-none text-right pr-2 text-slate-600 font-mono text-[11px] shrink-0">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`h-5 leading-5 ${
                  errorLine === i + 1 ? 'text-rose-400 font-bold bg-rose-950/40' : ''
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
            className="flex-1 w-full h-full bg-transparent p-2 text-slate-100 resize-none outline-none font-mono text-xs leading-5 focus:ring-0 selection:bg-indigo-600/40"
            placeholder="Type tactics here..."
          />
        </div>
      </div>
    );
  }
);

LeanEditor.displayName = 'LeanEditor';
