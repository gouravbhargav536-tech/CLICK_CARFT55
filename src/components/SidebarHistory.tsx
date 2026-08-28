import React, { useState } from 'react';
import { ConversationSession } from '../types';
import { Plus, Search, MessageSquare, Trash2, Pin, ShieldCheck, ChevronLeft, Volume2, Sparkles, Lock } from 'lucide-react';

interface SidebarHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (session: ConversationSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-80 bg-[#000000] border-r border-neutral-900 flex flex-col justify-between shadow-2xl transition-all duration-300">
      {/* Top Header */}
      <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-4 h-4 text-white" />
          <h2 className="font-bold text-xs tracking-widest text-white uppercase">
            Conversations
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar: New Voice Session */}
      <div className="p-4 border-b border-neutral-900 space-y-4">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all uppercase"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Sparkles className="w-6 h-6 text-neutral-700 mx-auto mb-3" />
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">No sessions yet</p>
            <p className="text-[10px] text-neutral-600 mt-2 tracking-wider leading-relaxed">
              Start talking to record real-time translations securely.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const messageCount = session.messages.length;
            const lastMsg = session.messages[session.messages.length - 1];

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 shadow-xl'
                    : 'bg-neutral-950 border-neutral-900 hover:bg-neutral-900 hover:border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span className="text-xs font-bold text-neutral-200 line-clamp-1 tracking-wide">
                      {session.title || 'Translation'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-white transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {lastMsg && (
                  <p className="text-[11px] text-neutral-400 mt-2 line-clamp-1 italic font-medium">
                    "{lastMsg.text}"
                  </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                  <span>{session.sourceLang} ➔ {session.targetLang}</span>
                  <span>{messageCount} msg{messageCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Security Badge & Clear Button */}
      <div className="p-4 border-t border-neutral-900 bg-[#000000] space-y-3">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <div className="flex items-center space-x-2 text-white">
            <Lock className="w-3.5 h-3.5" />
            <span>Local Storage</span>
          </div>
          <span className="text-neutral-600">Private</span>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={onClearAll}
            className="w-full text-center text-[10px] uppercase tracking-widest font-bold text-neutral-600 hover:text-white py-1 transition-colors"
          >
            Clear All History
          </button>
        )}
      </div>
    </aside>
  );
};
