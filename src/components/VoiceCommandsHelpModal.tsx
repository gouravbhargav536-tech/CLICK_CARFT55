import React from 'react';
import { Mic, X, Command, Sparkles, CheckCircle2, Zap, FileText, RefreshCw, Trash2, Globe } from 'lucide-react';

interface VoiceCommandsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCommandsHelpModal: React.FC<VoiceCommandsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const commands = [
    {
      phrase: '“Summarize session”',
      description: 'Generates a Gemini AI executive summary, key topics, and action takeaways at the top of the transcript.',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      phrase: '“Export PDF” or “Download report”',
      description: 'Triggers the printable bilingual PDF report generator for the current active session.',
      icon: FileText,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      phrase: '“Clear chat” or “Clear session”',
      description: 'Clears current transcript messages or resets the active conversation.',
      icon: Trash2,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      phrase: '“Swap language” or “Swap languages”',
      description: 'Instantly swaps source and target translation languages.',
      icon: RefreshCw,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      phrase: '“Translate to [Language]”',
      description: 'Changes target translation language (e.g., “Translate to Spanish”, “Change language to French”).',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      phrase: '“Toggle auto speak”',
      description: 'Toggles automatic text-to-speech audio feedback on or off.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Command className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Voice Command Shortcuts</h2>
            <p className="text-xs text-slate-400">
              Speak naturally into your mic — commands execute automatically during speech recognition
            </p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {commands.map((cmd, i) => {
            const IconComp = cmd.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3.5 hover:border-slate-700 transition-all"
              >
                <div className={`p-2.5 rounded-xl border ${cmd.color} shrink-0`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 font-mono">{cmd.phrase}</span>
                    <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      Live Voice Command
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cmd.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Voice command engine active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
