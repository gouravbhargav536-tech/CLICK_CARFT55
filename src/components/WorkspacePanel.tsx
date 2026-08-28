import React, { useState, useEffect } from 'react';
import {
  Mail,
  Calendar,
  CheckSquare,
  MessageSquare,
  GraduationCap,
  Users,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { listUpcomingEvents, scheduleCalendarEvent, CalendarEvent } from '../services/calendarService';

interface WorkspacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<
    'gmail' | 'calendar' | 'tasks' | 'chat' | 'classroom' | 'contacts'
  >('gmail');

  const [workspaceData, setWorkspaceData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Calendar State & Scheduling
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarStatusMsg, setCalendarStatusMsg] = useState<string>('');
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMeetingSummary, setNewMeetingSummary] = useState('');
  const [newMeetingStart, setNewMeetingStart] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('30');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Google Meet');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'calendar') {
        fetchCalendarEvents();
      } else {
        fetchWorkspaceData(activeTab);
      }
    }
  }, [isOpen, activeTab]);

  const fetchCalendarEvents = async () => {
    setIsCalendarLoading(true);
    try {
      const res = await listUpcomingEvents(10);
      if (res.items) {
        setCalendarEvents(res.items);
      }
      if (res.message) {
        setCalendarStatusMsg(res.message);
      }
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingSummary.trim()) return;
    setIsScheduling(true);
    setScheduleFeedback('');
    try {
      const startIso = newMeetingStart
        ? new Date(newMeetingStart).toISOString()
        : new Date(Date.now() + 3600000).toISOString();

      const result = await scheduleCalendarEvent({
        summary: newMeetingSummary.trim(),
        start: startIso,
        durationMinutes: parseInt(newMeetingDuration, 10) || 30,
        location: newMeetingLocation.trim() || 'Google Meet',
      });

      if (result.success) {
        setScheduleFeedback(result.message || 'Meeting scheduled successfully!');
        setNewMeetingSummary('');
        setNewMeetingStart('');
        setIsFormOpen(false);
        fetchCalendarEvents();
      } else {
        setScheduleFeedback(result.message || 'Failed to schedule meeting.');
      }
    } catch (err: any) {
      setScheduleFeedback(err?.message || 'Error scheduling meeting.');
    } finally {
      setIsScheduling(false);
    }
  };

  const fetchWorkspaceData = async (service: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workspace/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();
      setWorkspaceData((prev) => ({ ...prev, [service]: data }));
    } catch (err) {
      console.warn('Workspace fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-red-400' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-blue-400' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-yellow-400' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-emerald-400' },
    { id: 'classroom', label: 'Classroom', icon: GraduationCap, color: 'text-purple-400' },
    { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-cyan-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden bg-[#121215]/95 border border-purple-500/30 rounded-2xl shadow-2xl text-[#ECECF1] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-gradient-to-r from-purple-950/40 via-zinc-900 to-blue-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Workspace Hub</h2>
              <p className="text-xs text-zinc-400">
                Gmail • Calendar • Tasks • Chat • Classroom • Contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-zinc-950/80 border-b border-zinc-800 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-purple-900/40 text-white border border-purple-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected via OAuth Scope Permissions
            </div>
            <button
              onClick={() => fetchWorkspaceData(activeTab)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Service Panel Specific Details */}
          {activeTab === 'gmail' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Gmail Assistant Integration
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    https://mail.google.com/
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Ask AetherVoice aloud to check unread emails, summarize messages, or draft replies.
                </p>
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('Summarize my recent Gmail messages');
                      onClose();
                    }
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-1 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Ask AI: "Summarize my emails"
                </button>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Header Card */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400">Google Calendar Hub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchCalendarEvents}
                      disabled={isCalendarLoading}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition flex items-center gap-1"
                      title="Refresh Calendar"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCalendarLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => setIsFormOpen(!isFormOpen)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isFormOpen ? 'Close Form' : 'Schedule Meeting'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-300">
                  Manage events directly or use natural voice commands ("List my events", "Schedule meeting tomorrow at 3 PM").
                </p>

                {/* Voice Commands Bar */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onSendToChat) {
                        onSendToChat('What events do I have on my Google Calendar today?');
                        onClose();
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-1 transition"
                  >
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                    Voice: "List my events today"
                  </button>

                  <button
                    onClick={() => {
                      if (onSendToChat) {
                        onSendToChat('Schedule a meeting titled Team Sync tomorrow at 3 PM');
                        onClose();
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1 transition"
                  >
                    <ChevronRight className="w-3 h-3 text-indigo-400" />
                    Voice: "Schedule Team Sync tomorrow at 3 PM"
                  </button>
                </div>
              </div>

              {/* Schedule Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleCreateMeeting}
                  className="p-4 rounded-xl bg-zinc-900 border border-blue-500/30 space-y-3"
                >
                  <h4 className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-400" />
                    Schedule New Google Calendar Event
                  </h4>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Meeting Title / Summary</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Product Sync & Design Review"
                      value={newMeetingSummary}
                      onChange={(e) => setNewMeetingSummary(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={newMeetingStart}
                        onChange={(e) => setNewMeetingStart(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Duration (minutes)</label>
                      <select
                        value={newMeetingDuration}
                        onChange={(e) => setNewMeetingDuration(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">1 hour</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Location / Video Link</label>
                    <input
                      type="text"
                      placeholder="e.g., Google Meet"
                      value={newMeetingLocation}
                      onChange={(e) => setNewMeetingLocation(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isScheduling}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
                    >
                      {isScheduling ? 'Scheduling...' : 'Save to Google Calendar'}
                    </button>
                  </div>
                </form>
              )}

              {scheduleFeedback && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{scheduleFeedback}</span>
                </div>
              )}

              {/* Status Notice */}
              {calendarStatusMsg && (
                <div className="text-[11px] text-zinc-400 italic bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80">
                  {calendarStatusMsg}
                </div>
              )}

              {/* Event List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Upcoming Events ({calendarEvents.length})</span>
                  {isCalendarLoading && <span className="text-[10px] text-blue-400">Loading...</span>}
                </h4>

                {calendarEvents.length === 0 && !isCalendarLoading ? (
                  <div className="p-6 text-center text-xs text-zinc-500 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    No upcoming events found on Google Calendar.
                  </div>
                ) : (
                  calendarEvents.map((evt) => {
                    const startFormatted = evt.start?.dateTime
                      ? new Date(evt.start.dateTime).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'All Day';

                    return (
                      <div
                        key={evt.id || Math.random()}
                        className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-zinc-100">{evt.summary}</h5>
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-blue-400 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{evt.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                          <span className="flex items-center gap-1 text-blue-300">
                            <Clock className="w-3 h-3 text-blue-400" />
                            {startFormatted}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1 text-zinc-300">
                              <MapPin className="w-3 h-3 text-zinc-500" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    Google Tasks Integration
                  </span>
                  <span className="text-[10px] text-zinc-500">tasklists/@default</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Manage to-do items hands-free, create new tasks, and check completed goals.
                </p>
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('List my pending tasks from Google Tasks');
                      onClose();
                    }
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30 flex items-center gap-1 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Ask AI: "Show my pending Google Tasks"
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Google Chat Integration
                  </span>
                  <span className="text-[10px] text-zinc-500">spaces & messages</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Connect with team spaces and send voice-prompted updates to Google Chat.
                </p>
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('Draft a quick team update message for Google Chat');
                      onClose();
                    }
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Ask AI: "Draft Google Chat update"
                </button>
              </div>
            </div>
          )}

          {activeTab === 'classroom' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Google Classroom Integration
                  </span>
                  <span className="text-[10px] text-zinc-500">courses & coursework</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Check coursework deadlines, announcements, and study material directly.
                </p>
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('Check my Google Classroom courses and upcoming assignments');
                      onClose();
                    }
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 flex items-center gap-1 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Ask AI: "Check my Google Classroom"
                </button>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Google Contacts Integration
                  </span>
                  <span className="text-[10px] text-zinc-500">people & directory</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Find contact email addresses, phone numbers, and organizational profiles.
                </p>
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('Search my Google Contacts for emails');
                      onClose();
                    }
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-1 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Ask AI: "Search Google Contacts"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
