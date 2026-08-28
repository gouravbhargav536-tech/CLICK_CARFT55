import { POPULAR_LANGUAGES } from '../constants/languages';
import { Language } from '../types';

export type VoiceCommandType =
  | 'SUMMARIZE'
  | 'CLEAR_CHAT'
  | 'SWAP_LANGUAGES'
  | 'EXPORT_PDF'
  | 'CHANGE_TARGET_LANG'
  | 'CHANGE_SOURCE_LANG'
  | 'TOGGLE_AUTO_SPEAK'
  | 'TOGGLE_HANDS_FREE';

export interface VoiceCommandResult {
  isCommand: boolean;
  type?: VoiceCommandType;
  targetLanguage?: Language;
  sourceLanguage?: Language;
  feedbackMessage?: string;
  originalText: string;
}

export function parseVoiceCommand(text: string): VoiceCommandResult {
  const normalized = text.toLowerCase().trim();

  // 1. Summarize session
  if (
    normalized.includes('summarize session') ||
    normalized.includes('summarize conversation') ||
    normalized.includes('summarize transcript') ||
    normalized.includes('generate summary') ||
    normalized === 'summarize'
  ) {
    return {
      isCommand: true,
      type: 'SUMMARIZE',
      feedbackMessage: '⚡ Voice Command Triggered: Summarizing active conversation session...',
      originalText: text,
    };
  }

  // 2. Clear chat
  if (
    normalized.includes('clear chat') ||
    normalized.includes('clear conversation') ||
    normalized.includes('clear transcript') ||
    normalized.includes('delete messages') ||
    normalized.includes('clear session')
  ) {
    return {
      isCommand: true,
      type: 'CLEAR_CHAT',
      feedbackMessage: '⚡ Voice Command Triggered: Clearing conversation transcript logs...',
      originalText: text,
    };
  }

  // 3. Swap languages
  if (
    normalized.includes('swap language') ||
    normalized.includes('swap languages') ||
    normalized.includes('switch languages') ||
    normalized.includes('flip languages')
  ) {
    return {
      isCommand: true,
      type: 'SWAP_LANGUAGES',
      feedbackMessage: '⚡ Voice Command Triggered: Swapping source and target languages...',
      originalText: text,
    };
  }

  // 4. Export PDF
  if (
    normalized.includes('export pdf') ||
    normalized.includes('download pdf') ||
    normalized.includes('export transcript') ||
    normalized.includes('download report') ||
    normalized.includes('save as pdf')
  ) {
    return {
      isCommand: true,
      type: 'EXPORT_PDF',
      feedbackMessage: '⚡ Voice Command Triggered: Generating bilingual PDF transcript report...',
      originalText: text,
    };
  }

  // 5. Toggle Auto Speak
  if (normalized.includes('toggle auto speak') || normalized.includes('toggle voice output')) {
    return {
      isCommand: true,
      type: 'TOGGLE_AUTO_SPEAK',
      feedbackMessage: '⚡ Voice Command Triggered: Toggling automatic voice output...',
      originalText: text,
    };
  }

  // 6. Toggle Hands Free
  if (normalized.includes('toggle hands free') || normalized.includes('toggle continuous listening')) {
    return {
      isCommand: true,
      type: 'TOGGLE_HANDS_FREE',
      feedbackMessage: '⚡ Voice Command Triggered: Toggling hands-free continuous audio mode...',
      originalText: text,
    };
  }

  // 7. Change target language: "translate to spanish", "change language to french", "set target german"
  const targetMatchPhrases = [
    'translate to ',
    'change target to ',
    'change language to ',
    'set target language ',
    'set target ',
    'switch to ',
  ];

  for (const phrase of targetMatchPhrases) {
    if (normalized.includes(phrase)) {
      const requestedLangName = normalized.split(phrase)[1]?.trim();
      if (requestedLangName) {
        const foundLang = POPULAR_LANGUAGES.find(
          (l) =>
            l.name.toLowerCase() === requestedLangName ||
            l.code.toLowerCase() === requestedLangName ||
            requestedLangName.includes(l.name.toLowerCase())
        );

        if (foundLang) {
          return {
            isCommand: true,
            type: 'CHANGE_TARGET_LANG',
            targetLanguage: foundLang,
            feedbackMessage: `⚡ Voice Command Triggered: Target language set to ${foundLang.flag} ${foundLang.name}`,
            originalText: text,
          };
        }
      }
    }
  }

  // 8. Change source language
  const sourceMatchPhrases = ['change source to ', 'set source language ', 'set source '];
  for (const phrase of sourceMatchPhrases) {
    if (normalized.includes(phrase)) {
      const requestedLangName = normalized.split(phrase)[1]?.trim();
      if (requestedLangName) {
        const foundLang = POPULAR_LANGUAGES.find(
          (l) =>
            l.name.toLowerCase() === requestedLangName ||
            l.code.toLowerCase() === requestedLangName ||
            requestedLangName.includes(l.name.toLowerCase())
        );

        if (foundLang) {
          return {
            isCommand: true,
            type: 'CHANGE_SOURCE_LANG',
            sourceLanguage: foundLang,
            feedbackMessage: `⚡ Voice Command Triggered: Source language set to ${foundLang.flag} ${foundLang.name}`,
            originalText: text,
          };
        }
      }
    }
  }

  return { isCommand: false, originalText: text };
}
