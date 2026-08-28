import { Language } from '../types';

export const DEFAULT_LANGUAGE: Language = {
  code: 'hi',
  name: 'Hindi',
  nativeName: 'हिन्दी (Hindi)',
  flag: '🇮🇳',
  speechCode: 'hi-IN',
};

export const POPULAR_LANGUAGES: Language[] = [
  DEFAULT_LANGUAGE,
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文 (普通话)', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'he', name: 'Hebrew', nativeName: 'עבריत', flag: '🇮🇱', speechCode: 'he-IL' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },
];

export const AUTO_DETECT_LANGUAGE: Language = {
  code: 'auto',
  name: 'Auto Detect',
  nativeName: 'Auto Detect Language',
  flag: '🌐',
  speechCode: 'hi-IN',
};

