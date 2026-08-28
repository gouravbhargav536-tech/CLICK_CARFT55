import React from 'react';
import { ChatMessage } from '../types';
import { User, Sparkles, MessageSquare } from 'lucide-react';

interface LiveTranscriptViewProps {
  messages: ChatMessage[];
  onOpenFullConversation: () => void;
}

export const LiveTranscriptView: React.FC<LiveTranscriptViewProps> = ({
  messages,
  onOpenFullConversation,
}) => {
  // Find the latest user message and latest AI message
  const userMessages = messages.filter((m) => m.role === 'user');
  const aiMessages = messages.filter((m) => m.role === 'assistant');

  const latestUser = userMessages[userMessages.length - 1];
  const latestAi = aiMessages[aiMessages.length - 1];

  if (!latestUser && !latestAi) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 rounded-2xl space-card-glass text-center space-y-1 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 space-text-glow">Live Cosmic Transcript</p>
        <p className="text-xs text-zinc-300">Your recent voice conversation will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-5 rounded-2xl space-card-glass shadow-2xl space-y-3.5">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-sm shadow-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 space-text-glow">
            Live Cosmic Transcript
          </span>
        </div>

        <button
          onClick={onOpenFullConversation}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
          <span>Open Full Conversation</span>
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Latest User Turn */}
        {latestUser && (
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-sm">
            <div className="p-1 rounded-md bg-purple-500/20 text-purple-300 shrink-0 mt-0.5 border border-purple-500/30">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="font-bold text-white space-text-glow">You</span>
              {latestUser.imageBase64 && (
                <div className="my-1.5 max-w-[200px] rounded-lg overflow-hidden border border-purple-500/40 shadow-md">
                  <img
                    src={latestUser.imageBase64}
                    alt="Attached visual"
                    className="w-full h-auto max-h-36 object-cover"
                  />
                </div>
              )}
              <p className="text-zinc-200 text-xs leading-relaxed">“{latestUser.text}”</p>
            </div>
          </div>
        )}

        {/* Latest AI Turn */}
        {latestAi && (
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 shadow-sm">
            <div className="p-1 rounded-md bg-purple-500/30 text-purple-200 shrink-0 mt-0.5 border border-purple-500/40">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-purple-300 space-text-glow">AetherVoice</span>
              <p className="text-white font-medium text-xs leading-relaxed">
                “{latestAi.text || (latestAi.isStreaming ? 'Thinking...' : '')}”
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

