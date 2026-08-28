import React from 'react';
import { X, User, ShieldCheck, Sparkles, Activity, Clock, Heart } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  sessionCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#212121] border border-[#2f2f2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10A37F]/20 flex items-center justify-center text-[#10A37F]">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#ECECF1]">AetherVoice Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9B9B9B] hover:text-[#ECECF1] hover:bg-[#2f2f2f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#ECECF1] bg-[#171717]">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#212121] border border-[#2f2f2f]">
            <div className="w-12 h-12 rounded-full bg-[#10A37F] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              AV
            </div>
            <div>
              <h4 className="font-bold text-[#ECECF1]">AetherVoice Subscriber</h4>
              <p className="text-[10px] text-[#10A37F]">ChatGPT Voice Mode Tier</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-[#212121] border border-[#2f2f2f] space-y-1">
              <div className="flex items-center space-x-1 text-[#10A37F]">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold text-[10px]">Saved Sessions</span>
              </div>
              <p className="text-lg font-bold text-[#ECECF1]">{sessionCount}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#212121] border border-[#2f2f2f] space-y-1">
              <div className="flex items-center space-x-1 text-[#10A37F]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold text-[10px]">AI Engine</span>
              </div>
              <p className="text-xs font-bold text-[#ECECF1]">Gemini 3.6</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10A37F]/10 border border-[#10A37F]/25 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#10A37F] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#ECECF1]">
              Your voice sessions use server-side encrypted Gemini processing. Your data is private and secure.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2f2f2f] bg-[#171717]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#10A37F] hover:bg-[#0d8a6c] text-white font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
