import { ConversationSession, ChatMessage, VoiceConfig, CustomApiKeys, ApiKeyValidationResult } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'aether_voice_sessions_v1',
  ACTIVE_SESSION: 'aether_voice_active_session_id',
  VOICE_CONFIG: 'aether_voice_config_v1',
  CUSTOM_API_KEYS: 'aether_voice_custom_keys_v1',
};

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceName: 'Swara / Google हिन्दी (Fast Hindi)',
  speed: 1.25,
  pitch: 1.05,
  autoSpeak: true,
  handsFree: false,
  visualizerPreset: 'quantum',
  voiceEngine: 'instant',
  vocalFeeling: 'natural',
  responseMode: 'quick',
};

// Safe obfuscation helper for secure local storage storage
function encodeData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonString));
  } catch {
    return JSON.stringify(data);
  }
}

function decodeData(encoded: string): any {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString);
  } catch {
    try {
      return JSON.parse(encoded);
    } catch {
      return null;
    }
  }
}

export function getSavedSessions(): ConversationSession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!raw) return [];
  const decoded = decodeData(raw);
  return Array.isArray(decoded) ? decoded : [];
}

export function saveSession(session: ConversationSession): void {
  if (typeof window === 'undefined') return;
  const sessions = getSavedSessions();
  const index = sessions.findIndex((s) => s.id === session.id);

  if (index >= 0) {
    sessions[index] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.unshift({ ...session, updatedAt: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, encodeData(sessions));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, session.id);
}

export function deleteSession(sessionId: string): ConversationSession[] {
  if (typeof window === 'undefined') return [];
  const sessions = getSavedSessions().filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, encodeData(sessions));
  return sessions;
}

export function clearAllSessions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

export function getVoiceConfig(): VoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_VOICE_CONFIG;
  const raw = localStorage.getItem(STORAGE_KEYS.VOICE_CONFIG);
  if (!raw) return DEFAULT_VOICE_CONFIG;
  const decoded = decodeData(raw);
  return { ...DEFAULT_VOICE_CONFIG, ...decoded };
}

export function saveVoiceConfig(config: VoiceConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VOICE_CONFIG, encodeData(config));
}

export function exportHistoryJSON(): void {
  const sessions = getSavedSessions();
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AetherVoice_History_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getCustomApiKeys(): CustomApiKeys {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEYS);
  if (!raw) return {};
  const decoded = decodeData(raw);
  return decoded && typeof decoded === 'object' ? decoded : {};
}

export function saveCustomApiKey(
  provider: 'gemini' | 'groq',
  apiKey: string,
  latency?: number
): CustomApiKeys {
  if (typeof window === 'undefined') return {};
  const existing = getCustomApiKeys();
  const updated: CustomApiKeys = {
    ...existing,
    [provider]: apiKey.trim(),
    [`${provider}ValidatedAt`]: new Date().toISOString(),
    [`${provider}Latency`]: latency,
  };
  localStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEYS, encodeData(updated));
  return updated;
}

export function removeCustomApiKey(provider: 'gemini' | 'groq'): CustomApiKeys {
  if (typeof window === 'undefined') return {};
  const existing = getCustomApiKeys();
  delete existing[provider];
  delete (existing as any)[`${provider}ValidatedAt`];
  delete (existing as any)[`${provider}Latency`];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEYS, encodeData(existing));
  return existing;
}

export async function validateApiKey(
  provider: 'gemini' | 'groq',
  apiKey: string
): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch('/api/validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
    });
    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      valid: false,
      provider,
      error: err?.message || 'Network error: could not connect to validation server.',
    };
  }
}

