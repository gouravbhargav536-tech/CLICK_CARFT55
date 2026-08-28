import React, { useState } from 'react';
import { X, Calculator as CalcIcon, Equal, Delete, Sparkles } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToVoice: (resultText: string) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onSendToVoice,
}) => {
  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleBtnClick = (val: string) => {
    setDisplay((prev) => prev + val);
  };

  const handleClear = () => {
    setDisplay('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!display) return;
    try {
      // Safe evaluation of mathematical expression
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      const resStr = String(res);
      const entry = `${display} = ${resStr}`;
      setHistory((prev) => [entry, ...prev.slice(0, 4)]);
      setDisplay(resStr);
    } catch {
      setDisplay('Error');
    }
  };

  const handleAskVoice = () => {
    if (display) {
      onSendToVoice(`Calculate ${display}`);
      onClose();
    }
  };

  const buttons = [
    'C', '÷', '×', '⌫',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '0', '.', '(', ')'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#212121] border border-[#2f2f2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10A37F]/20 flex items-center justify-center text-[#10A37F]">
              <CalcIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#ECECF1]">AetherVoice Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9B9B9B] hover:text-[#ECECF1] hover:bg-[#2f2f2f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-[#171717] border-b border-[#2f2f2f] space-y-1">
          <div className="text-right text-xs text-[#9B9B9B] min-h-[1.25rem]">
            {history[0] || ''}
          </div>
          <div className="text-right text-2xl font-mono font-bold text-[#10A37F] overflow-x-auto whitespace-nowrap">
            {display || '0'}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-[#171717]">
          {buttons.map((btn) => {
            const isOp = ['÷', '×', '-', '+', '='].includes(btn);
            const isSpecial = ['C', '⌫'].includes(btn);

            return (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') handleClear();
                  else if (btn === '⌫') handleBackspace();
                  else if (btn === '=') handleCalculate();
                  else handleBtnClick(btn);
                }}
                className={`p-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  btn === '='
                    ? 'bg-[#10A37F] text-white shadow-lg'
                    : isOp
                    ? 'bg-[#10A37F]/20 text-[#10A37F] border border-[#10A37F]/30'
                    : isSpecial
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-[#212121] text-[#ECECF1] border border-[#2f2f2f] hover:bg-[#2f2f2f]'
                }`}
              >
                {btn}
              </button>
            );
          })}
        </div>

        {/* Footer: Ask AetherVoice */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717]">
          <button
            onClick={handleAskVoice}
            disabled={!display}
            className="w-full py-2 px-4 rounded-xl bg-[#10A37F] hover:bg-[#0d8a6c] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AetherVoice to Solve & Explain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
