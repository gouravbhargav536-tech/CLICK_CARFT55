import React from 'react';
import { ChatMessage } from '../types';
import { X, User, Sparkles, Volume2, Download, FileText, Trash2 } from 'lucide-react';

interface FullConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onPlaySpeech: (text: string) => void;
  onClearHistory: () => void;
  onExportPdf: () => void;
}

export const FullConversationModal: React.FC<FullConversationModalProps> = ({
  isOpen,
  onClose,
  messages,
  onPlaySpeech,
  onClearHistory,
  onExportPdf,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#212121] border border-[#2f2f2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10A37F]/20 flex items-center justify-center text-[#10A37F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#ECECF1]">Full Conversation History</h3>
              <p className="text-[10px] text-[#9B9B9B]">{messages.length} messages in current session</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExportPdf}
              className="p-1.5 rounded-xl bg-[#2f2f2f] border border-[#3e3e3e] text-[#ECECF1] hover:bg-[#3e3e3e] text-xs font-semibold flex items-center space-x-1"
              title="Export PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-[#10A37F]" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-1"
              title="Clear Session History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#9B9B9B] hover:text-[#ECECF1] hover:bg-[#2f2f2f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#171717]">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-[#9B9B9B] text-xs">
              No conversation history yet. Start by tapping the microphone or typing a prompt!
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-3 p-3.5 rounded-2xl border text-xs ${
                    isUser
                      ? 'bg-[#2f2f2f] border-[#3e3e3e] text-[#ECECF1]'
                      : 'bg-[#10A37F]/10 border-[#10A37F]/25 text-[#ECECF1]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser ? 'bg-[#3e3e3e] text-[#ECECF1]' : 'bg-[#10A37F]/20 text-[#10A37F]'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isUser ? 'text-[#ECECF1]' : 'text-[#10A37F]'}`}>
                        {isUser ? 'You' : 'AetherVoice'}
                      </span>
                      <span className="text-[10px] text-[#9B9B9B]">{m.timestamp}</span>
                    </div>

                    {m.imageBase64 && (
                      <div className="my-2 max-w-xs rounded-xl overflow-hidden border border-purple-500/40 shadow-md">
                        <img
                          src={m.imageBase64}
                          alt="Message attachment"
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                    {!isUser && m.text && (
                      <button
                        onClick={() => onPlaySpeech(m.text)}
                        className="inline-flex items-center space-x-1 mt-1 text-[10px] font-semibold text-[#60A5FA] hover:underline"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen to Audio</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
