// Speech Recognition & Audio Processing Utility
import { VocalFeeling } from '../types';
import { getCustomApiKeys } from './storage';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface AudioAnalyzerControls {
  stop: () => void;
  getVolume: () => number;
  getFrequencyData: () => Uint8Array;
}

// Global SpeechRecognition type definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  langCode: string,
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  onSpeechStart?: () => void
) {
  const SpeechRecognitionClass =
    (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

  if (!SpeechRecognitionClass) {
    onError('आपके ब्राउज़र में Web Speech Recognition उपलब्ध नहीं है। आप नीचे लिखकर पूछ सकते हैं!');
    return null;
  }

  let recognition: any;
  try {
    recognition = new SpeechRecognitionClass();
  } catch (err: any) {
    onError('स्पीच रिकॉग्निशन शुरू करने में समस्या हुई: ' + (err?.message || 'Unknown error'));
    return null;
  }

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Language mapping
  const effectiveLang =
    langCode === 'auto' || !langCode
      ? 'hi-IN'
      : langCode === 'en'
      ? 'en-US'
      : langCode.includes('-')
      ? langCode
      : `${langCode}-IN`;

  recognition.lang = effectiveLang;

  let finalTranscript = '';
  let isDone = false;

  recognition.onstart = () => {
    finalTranscript = '';
    isDone = false;
    if (onSpeechStart) onSpeechStart();
  };

  recognition.onspeechstart = () => {
    if (onSpeechStart) onSpeechStart();
  };

  recognition.onsoundstart = () => {
    if (onSpeechStart) onSpeechStart();
  };

  recognition.onresult = (event: any) => {
    if (onSpeechStart) onSpeechStart();
    let interim = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const item = event.results[i];
      if (item.isFinal) {
        finalTranscript += item[0].transcript + ' ';
      } else {
        interim += item[0].transcript;
      }
    }

    const currentText = (finalTranscript + interim).trim();
    if (currentText) {
      onResult({
        transcript: currentText,
        isFinal: false,
      });
    }
  };

  recognition.onerror = (event: any) => {
    const errorType = event.error;
    if (errorType === 'no-speech') {
      // User paused or didn't speak yet
      return;
    }
    if (errorType === 'aborted') {
      return;
    }
    if (errorType === 'not-allowed') {
      onError('माइक्रोफ़ोन की अनुमति (Permission) दें ताकि आपकी आवाज़ सुनी जा सके।');
      return;
    }
    if (errorType === 'network') {
      onError('इंटरनेट कनेक्शन की जाँच करें (Network issue in speech recognition).');
      return;
    }
    onError(`स्पीच एरर: ${errorType}`);
  };

  recognition.onend = () => {
    if (!isDone && finalTranscript.trim()) {
      isDone = true;
      onResult({
        transcript: finalTranscript.trim(),
        isFinal: true,
      });
    }
    onEnd();
  };

  return recognition;
}

// Setup live AudioContext analyzer with high clarity audio constraints
export async function setupMicrophoneAnalyzer(
  onStreamReady?: (stream: MediaStream) => void
): Promise<AudioAnalyzerControls | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000,
      },
      video: false,
    });
    if (onStreamReady) onStreamReady(stream);

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    return {
      getVolume: () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        return Math.min(100, Math.round((sum / dataArray.length) * 0.85));
      },
      getFrequencyData: () => {
        analyser.getByteFrequencyData(dataArray);
        return dataArray;
      },
      stop: () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      },
    };
  } catch (err) {
    console.warn('Microphone access denied or unavailable:', err);
    return null;
  }
}

// Global configuration flag to switch between speech engines:
// - USE_CLOUD_TTS = true: Uses Google Cloud Text-to-Speech (hi-IN-Wavenet-A)
// - USE_EDGE_TTS = true: Uses Microsoft Edge Neural TTS (hi-IN-SwaraNeural, free, crystal-clear human voice)
// - If both are false: Uses the browser's built-in SpeechSynthesis with the best available Hindi voice
export const USE_CLOUD_TTS = false;
export const USE_EDGE_TTS = true;

// Audio instance for playing cloud / Edge TTS base64 audio
let activeCloudAudio: HTMLAudioElement | null = null;

// Global voice cache & precache loader
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Ensures browser SpeechSynthesis voices are loaded properly.
 * Resolves immediately if voices already available, or waits for the 'voiceschanged' event.
 */
export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const immediateVoices = window.speechSynthesis.getVoices();
    if (immediateVoices && immediateVoices.length > 0) {
      cachedVoices = immediateVoices;
      resolve(immediateVoices);
      return;
    }

    let resolved = false;
    const onVoices = () => {
      if (resolved) return;
      resolved = true;
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      } catch {}
      const loaded = window.speechSynthesis.getVoices();
      cachedVoices = loaded;
      resolve(loaded);
    };

    try {
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    } catch {
      window.speechSynthesis.onvoiceschanged = onVoices;
    }

    // Safety fallback timeout (500ms) in case the browser does not fire voiceschanged
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        } catch {}
        const fallbackVoices = window.speechSynthesis.getVoices();
        cachedVoices = fallbackVoices;
        resolve(fallbackVoices);
      }
    }, 500);
  });
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getBrowserVoices().catch(() => {});
}

/**
 * Selects the BEST available Hindi voice following the exact priority rules:
 * 1. Prefer a voice where lang is "hi-IN" AND the voice name includes "Google"
 * 2. If not available, fall back to any voice with lang "hi-IN"
 * 3. If still not available, fall back to any voice starting with "hi"
 */
export function getBestHindiVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const isHiInLang = (lang: string) => {
    const l = (lang || '').toLowerCase().replace('_', '-');
    return l === 'hi-in' || l === 'hi-india';
  };

  // 1. Voice where lang is "hi-IN" AND name includes "Google"
  const googleHindi = voices.find(
    (v) => isHiInLang(v.lang) && v.name.toLowerCase().includes('google')
  );
  if (googleHindi) return googleHindi;

  // 2. Any voice with lang "hi-IN"
  const anyHiIn = voices.find((v) => isHiInLang(v.lang));
  if (anyHiIn) return anyHiIn;

  // 3. Any voice starting with "hi" or containing "hindi" / "हिन्दी"
  const anyHi = voices.find(
    (v) =>
      (v.lang || '').toLowerCase().startsWith('hi') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.includes('हिन्दी')
  );
  if (anyHi) return anyHi;

  return null;
}

/**
 * Helper to select the most natural human voice available across languages
 */
export function getBestHumanVoice(
  effectiveLang: string,
  feeling?: VocalFeeling,
  preferredName?: string
): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length > 0
    ? cachedVoices
    : typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis.getVoices()
    : [];

  if (voices.length === 0) return undefined;

  const isHindi =
    effectiveLang.toLowerCase().startsWith('hi') || /[\u0900-\u097F]/.test(effectiveLang);

  if (isHindi) {
    const bestHindi = getBestHindiVoice(voices);
    if (bestHindi) return bestHindi;
  }

  // If a specific voice name was requested
  if (preferredName) {
    const matched = voices.find((v) =>
      v.name.toLowerCase().includes(preferredName.toLowerCase())
    );
    if (matched) return matched;
  }

  const primaryLang = effectiveLang.split('-')[0].toLowerCase();
  const matchedLang = voices.find((v) => (v.lang || '').toLowerCase().startsWith(primaryLang));
  if (matchedLang) return matchedLang;

  return voices.find((v) => (v.lang || '').toLowerCase().includes('en')) || voices[0];
}

/**
 * Stops all speech playback (Browser SpeechSynthesis + Google Cloud Audio)
 */
export function stopSpeech(): void {
  if (activeCloudAudio) {
    try {
      activeCloudAudio.pause();
      activeCloudAudio.currentTime = 0;
    } catch {}
    activeCloudAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Play text using ElevenLabs Text-to-Speech API (eleven_multilingual_v2)
 * Ultra-realistic, emotional, authentic Hindi voice generation.
 */
export async function playElevenLabsTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  voiceId?: string
): Promise<void> {
  try {
    const cleanText = normalizeHindiTextForTTS(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const keys = getCustomApiKeys();
    const apiKey = keys.elevenlabs || undefined;

    let base64Audio: string | null = null;

    // 1. Try backend server endpoint
    try {
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          apiKey,
          voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL', // Sarah (Multilingual, crystal-clear Hindi tone)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          base64Audio = data.audioContent;
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn('[ElevenLabs Backend API Error]:', errJson);
      }
    } catch (netErr) {
      console.warn('[ElevenLabs Backend unreachable, trying direct client]:', netErr);
    }

    // 2. If backend failed (e.g. static hosting on Vercel/Netlify without Node backend) and client has custom key, call ElevenLabs directly
    if (!base64Audio && apiKey) {
      const selectedVoice = voiceId || 'EXAVITQu4vr4xnSDxMaL';
      const directRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (directRes.ok) {
        const arrayBuf = await directRes.arrayBuffer();
        const binary = String.fromCharCode(...new Uint8Array(arrayBuf));
        base64Audio = window.btoa(binary);
      } else {
        const directErr = await directRes.text().catch(() => '');
        console.error('[ElevenLabs Direct Client API Error]:', directErr);
      }
    }

    if (!base64Audio) {
      throw new Error('ElevenLabs TTS audio could not be generated. Please ensure your ElevenLabs API key is configured.');
    }

    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    const audio = new Audio(audioUrl);
    activeCloudAudio = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      activeCloudAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      activeCloudAudio = null;
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    try {
      await audio.play();
    } catch (playErr) {
      // If browser blocked autoplay, attempt to handle gracefully
      console.warn('Audio play() interrupted by browser user-interaction policy:', playErr);
      if (onError) onError(playErr);
      if (onEnd) onEnd();
    }
  } catch (err) {
    activeCloudAudio = null;
    throw err;
  }
}

/**
 * Browser Web Speech API fallback (window.speechSynthesis)
 * Uses high-priority Hindi voice selection (hi-IN / Google हिन्दी)
 */
export async function playBrowserSpeechSynthesisFallback(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[TTS Fallback]: Web Speech API is not supported in this browser.');
    if (onError) onError(new Error('Web Speech API is not supported in this browser.'));
    if (onEnd) onEnd();
    return;
  }

  try {
    // Cancel any ongoing speech synthesis to prevent queue buildup
    window.speechSynthesis.cancel();

    const voices = await getBrowserVoices();
    const hindiVoice = getBestHindiVoice(voices);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      console.log(`[TTS Fallback]: Using browser voice: "${hindiVoice.name}" (${hindiVoice.lang})`);
    } else {
      console.warn('[TTS Fallback]: No specialized Hindi voice found in browser, using default voice.');
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    let finished = false;
    const safeEnd = () => {
      if (!finished) {
        finished = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      console.log('[TTS Fallback]: Browser SpeechSynthesis playback started.');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      console.log('[TTS Fallback]: Browser SpeechSynthesis playback finished.');
      safeEnd();
    };

    utterance.onerror = (event) => {
      console.error('[TTS Fallback Error]: Browser SpeechSynthesis error:', event.error, event);
      if (onError) onError(event);
      safeEnd();
    };

    // Chrome bug workaround: speechSynthesis sometimes gets paused unexpectedly
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);

    // Keep-alive heartbeat for longer sentences on Chromium
    const heartbeat = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(heartbeat);
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 1000);

  } catch (err) {
    console.error('[TTS Fallback Exception]:', err);
    if (onError) onError(err);
    if (onEnd) onEnd();
  }
}

/**
 * Primary Google Cloud Text-to-Speech call (hi-IN-Wavenet-A)
 * Compatible with:
 * 1. Netlify Production: /.netlify/functions/tts and /api/tts (via netlify.toml redirect)
 * 2. AI Studio Preview / Local Dev: /api/tts and /.netlify/functions/tts (via server.ts)
 */
export async function playGoogleCloudTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  // Endpoints to attempt in order (Netlify serverless function first, then API proxy)
  const endpoints = ['/.netlify/functions/tts', '/api/tts'];
  let lastError: any = null;
  let audioContent: string | null = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`[TTS Debug]: Attempting Google Cloud TTS via endpoint "${endpoint}"...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode: 'hi-IN',
          voiceName: 'hi-IN-Wavenet-A',
          speakingRate: 0.95,
          pitch: 0.0,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.warn(`[TTS Debug]: Endpoint ${endpoint} returned HTTP ${response.status}:`, errorBody);
        lastError = new Error(`TTS endpoint ${endpoint} failed with status ${response.status}: ${errorBody}`);
        continue; // Try next endpoint
      }

      const data = await response.json().catch(() => null);
      if (data && data.audioContent) {
        audioContent = data.audioContent;
        console.log(`[TTS Debug]: Successfully received Google Cloud TTS audio from ${endpoint}`);
        break;
      } else {
        const errDetails = data ? JSON.stringify(data) : 'Empty response';
        console.warn(`[TTS Debug]: Endpoint ${endpoint} returned 200 without audioContent:`, errDetails);
        lastError = new Error(`TTS endpoint ${endpoint} returned 200 without audioContent: ${errDetails}`);
      }
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        console.warn(`[TTS Debug]: Endpoint ${endpoint} timed out after 7s.`);
        lastError = new Error(`TTS endpoint ${endpoint} timed out.`);
      } else {
        console.warn(`[TTS Debug]: Network or CORS error calling ${endpoint}:`, fetchErr?.message || fetchErr);
        lastError = fetchErr;
      }
    }
  }

  if (!audioContent) {
    throw lastError || new Error('All Google Cloud TTS endpoints failed.');
  }

  // Play base64 audio via HTMLAudioElement
  const audioUrl = `data:audio/mp3;base64,${audioContent}`;
  const audio = new Audio(audioUrl);
  activeCloudAudio = audio;

  return new Promise<void>((resolve, reject) => {
    let resolved = false;
    const safeResolve = () => {
      if (!resolved) {
        resolved = true;
        activeCloudAudio = null;
        if (onEnd) onEnd();
        resolve();
      }
    };

    audio.onplay = () => {
      console.log('[TTS Debug]: Audio playback started.');
      if (onStart) onStart();
    };

    audio.onended = () => {
      console.log('[TTS Debug]: Audio playback completed.');
      safeResolve();
    };

    audio.onerror = (e) => {
      activeCloudAudio = null;
      console.error('[TTS Debug]: Audio element playback error:', e);
      if (onError) onError(e);
      safeResolve();
      reject(new Error('Audio playback failed in HTMLAudioElement.'));
    };

    audio.play().catch((playErr) => {
      activeCloudAudio = null;
      console.warn('[TTS Debug]: Audio play() interrupted by browser policy:', playErr);
      if (onError) onError(playErr);
      safeResolve();
      reject(playErr);
    });
  });
}

/**
 * Play text using Google Cloud Text-to-Speech REST API with automatic browser fallback
 */
export async function playCloudTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  return speakHindi(text, onStart, onEnd, onError);
}

/**
 * Play text using Gemini TTS
 */
export async function playGeminiTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  return speakHindi(text, onStart, onEnd, onError);
}

/**
 * Play text using Browser Speech
 */
export async function playBrowserSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  return playBrowserSpeechSynthesisFallback(text, onStart, onEnd, onError);
}

/**
 * Converts English/Hinglish digital marketing terms, currency symbols, phone numbers,
 * and bullet points into phonetically rich conversational Hindi with natural pauses.
 */
export function normalizeHindiTextForTTS(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let t = rawText
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[REALTIME_DATA_NEEDED\]/g, '')
    .replace(/\[REALTIME_CONSULTATION\]/g, '')
    .replace(/\[SAMPLE_IMAGE:\s*https?:\/\/[^\s\]]+\]/gi, '')
    .replace(/👉\s*यहाँ अपना[^\n\r]*👈/gi, '')
    .replace(/https?:\/\/[^\s\)\<\>\"\'\]]+/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[*#_~`>]/g, ' ');

  // 1. Phone number natural conversational pacing (9376124893 -> 93, 76, 12, 48, 93)
  t = t.replace(/(?:\+91[\s-]*)?([6-9]\d{1})[\s-]?(\d{2})[\s-]?(\d{2})[\s-]?(\d{2})[\s-]?(\d{2})/g, '$1, $2, $3, $4, $5');

  // 2. Specific Indian Currency conversions into natural Hindi words
  t = t.replace(/(?:₹|Rs\.?|INR)\s*500\b/gi, 'पाँच सौ रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*999\b/gi, 'नौ सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*1000\b/gi, 'एक हज़ार रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*1499\b/gi, 'चौदह सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*1999\b/gi, 'उन्नीस सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*2000\b/gi, 'दो हज़ार रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*2499\b/gi, 'चौबीस सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*2999\b/gi, 'उनतीस सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*4999\b/gi, 'चार हज़ार नौ सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*5000\b/gi, 'पाँच हज़ार रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*9999\b/gi, 'नौ हज़ार नौ सौ निन्यानवे रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*10000\b/gi, 'दस हज़ार रुपये');
  t = t.replace(/(?:₹|Rs\.?|INR)\s*(\d+)/gi, '$1 रुपये');
  t = t.replace(/(\d+)\s*\/-/g, '$1 रुपये');

  // 3. Percentage and common terms
  t = t.replace(/\b100%/g, 'सौ प्रतिशत');
  t = t.replace(/\b(\d+)%/g, '$1 प्रतिशत');
  t = t.replace(/\b24\/7\b/g, 'चौबीसों घंटे');

  // 4. Marketing and digital branding terms to authentic Hindi pronunciation
  const phoneticMap: [RegExp, string][] = [
    [/\bClickCraft\b/gi, 'क्लिक-क्राफ्ट'],
    [/\bWhatsApp\b/gi, 'व्हाट्सएप'],
    [/\bInstagram\b/gi, 'इंस्टाग्राम'],
    [/\bFacebook\b/gi, 'फेसबुक'],
    [/\bMeta\b/gi, 'मेटा'],
    [/\bGoogle\b/gi, 'गूगल'],
    [/\bAds\b/gi, 'ऐड्स'],
    [/\bAd\b/gi, 'ऐड'],
    [/\bWebsites\b/gi, 'वेबसाइट्स'],
    [/\bWebsite\b/gi, 'वेबसाइट'],
    [/\bPackage\b/gi, 'पैकेज'],
    [/\bPackages\b/gi, 'पैकेजेस'],
    [/\bCampaigns\b/gi, 'कैंपेन्स'],
    [/\bCampaign\b/gi, 'कैंपेन'],
    [/\bTargeted\b/gi, 'टारगेटेड'],
    [/\bDigital Marketing\b/gi, 'डिजिटल मार्केटिंग'],
    [/\bGraphic Design\b/gi, 'ग्राफिक डिज़ाइन'],
    [/\bGraphics\b/gi, 'ग्राफिक्स'],
    [/\bGraphic\b/gi, 'ग्राफिक'],
    [/\bOnline\b/gi, 'ऑनलाइन'],
    [/\bLeads\b/gi, 'लीड्स'],
    [/\bLead\b/gi, 'लीड'],
    [/\bROI\b/gi, 'आर ओ आई'],
    [/\bSEO\b/gi, 'एस ई ओ'],
    [/\bLive\b/gi, 'लाइव'],
    [/\bSupport\b/gi, 'सपोर्ट'],
    [/\bFeatures\b/gi, 'फीचर्स'],
    [/\bFeature\b/gi, 'फीचर'],
    [/\bBusiness\b/gi, 'बिजनेस'],
    [/\bClients\b/gi, 'क्लाइंट्स'],
    [/\bClient\b/gi, 'क्लाइंट'],
    [/\bPortfolio\b/gi, 'पोर्टफोलियो'],
    [/\bDomain\b/gi, 'डोमेन'],
    [/\bHosting\b/gi, 'होस्टिंग'],
    [/\bSSL\b/gi, 'एस एस एल'],
    [/\bFree\b/gi, 'फ्री'],
    [/\bFast\b/gi, 'फास्ट'],
    [/\bSpeed\b/gi, 'स्पीड'],
    [/\bAnalytics\b/gi, 'एनालिटिक्स'],
    [/\bCall\b/gi, 'कॉल'],
    [/\bMessage\b/gi, 'मैसेज'],
    [/\bSetup\b/gi, 'सेटअप'],
    [/\bPremium\b/gi, 'प्रीमियम'],
    [/\bStarter\b/gi, 'स्टार्टर'],
    [/\bStandard\b/gi, 'स्टैंडर्ड'],
    [/\bCustom\b/gi, 'कस्टम'],
    [/\bLogo\b/gi, 'लोगो'],
    [/\bBanner\b/gi, 'बैनर'],
    [/\bBanners\b/gi, 'बैनर्स'],
    [/\bVideo\b/gi, 'वीडियो'],
    [/\bReels\b/gi, 'रील्स'],
    [/\bPost\b/gi, 'पोस्ट'],
    [/\bPosts\b/gi, 'पोस्ट्स'],
  ];

  for (const [pattern, replacement] of phoneticMap) {
    t = t.replace(pattern, replacement);
  }

  // 5. Natural spacing for punctuation, slashes, and bullet points
  t = t.replace(/\s*\/\s*/g, ' या ');
  t = t.replace(/[:|]/g, ', ');
  t = t.replace(/^\s*[-•*]\s*/gm, ' ');
  t = t.replace(/\n+/g, '। ');
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

/**
 * Play text using Edge TTS - Routed through primary Hindi voice engine
 */
export async function playEdgeTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  return speakHindi(text, onStart, onEnd, onError);
}

/**
 * Main function to speak Hindi text when user clicks "Listen" or AI speaks.
 * Flow:
 * 1. Normalize text (cleans markdown, URLs, currency, phone numbers into natural Hindi).
 * 2. Primary: Google Cloud Text-to-Speech (hi-IN-Wavenet-A) via Netlify function.
 * 3. Automatic Fallback: If server TTS fails, times out, or has no key, automatically
 *    falls back to browser Web Speech API (speechSynthesis) using a Hindi (hi-IN) voice.
 * User ALWAYS hears voice in both Netlify production and AI Studio preview!
 */
export async function speakHindi(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: any) => void
): Promise<void> {
  stopSpeech();

  const cleanText = normalizeHindiTextForTTS(text);

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  console.log(`[TTS Debug]: Initiating speakHindi (Length: ${cleanText.length} chars)`);

  try {
    // 1. Try server-side Google Cloud TTS (Netlify function /.netlify/functions/tts or /api/tts)
    await playGoogleCloudTTS(cleanText, onStart, onEnd, (cloudErr) => {
      console.warn('[TTS Debug]: Google Cloud TTS audio element warning:', cloudErr);
    });
  } catch (serverTtsError: any) {
    // 2. AUTOMATIC FALLBACK: Server TTS failed, timed out, or unconfigured
    console.warn(
      '[TTS Debug]: Server Google Cloud TTS call failed or timed out. Reason:',
      serverTtsError?.message || serverTtsError
    );
    console.log('[TTS Debug]: Automatically falling back to browser Web Speech API (window.speechSynthesis) with hi-IN voice...');

    try {
      await playBrowserSpeechSynthesisFallback(cleanText, onStart, onEnd, onError);
    } catch (fallbackError: any) {
      console.error('[TTS Debug]: Both Google Cloud TTS and browser SpeechSynthesis failed:', fallbackError);
      if (onError) {
        onError(fallbackError);
      }
      if (onEnd) {
        onEnd();
      }
    }
  }
}

// Text to speech playback helper (Compatible with legacy callers & queues)
export function playTextToSpeech(
  text: string,
  langCode = 'hi-IN',
  onEnded?: () => void,
  options?: { speed?: number; pitch?: number; vocalFeeling?: VocalFeeling; voiceName?: string }
) {
  speakHindi(
    text,
    undefined,
    onEnded,
    (err) => console.warn('[TTS Debug]: playTextToSpeech issue:', err)
  ).catch(() => {
    if (onEnded) onEnded();
  });
}

/**
 * Zero-Delay SentenceSpeechQueue
 * Streams text responses chunk-by-chunk and starts speech playback
 * as soon as the first sentence finishes generating (<200ms).
 * Subsequent sentences are enqueued and spoken seamlessly in sequence.
 */
export class SentenceSpeechQueue {
  private queue: string[] = [];
  private textBuffer = '';
  private isPlaying = false;
  private langCode: string;
  private options: {
    speed?: number;
    pitch?: number;
    voiceName?: string;
    vocalFeeling?: VocalFeeling;
  };
  private onStartPlaying?: () => void;
  private onFinishedAll?: () => void;

  constructor(
    langCode = 'en-US',
    options?: {
      speed?: number;
      pitch?: number;
      voiceName?: string;
      vocalFeeling?: VocalFeeling;
    },
    onStartPlaying?: () => void,
    onFinishedAll?: () => void
  ) {
    this.langCode = langCode;
    this.options = options || {};
    this.onStartPlaying = onStartPlaying;
    this.onFinishedAll = onFinishedAll;
  }

  public addChunk(chunk: string) {
    this.textBuffer += chunk;
    this.processBuffer(false);
  }

  public flush() {
    this.processBuffer(true);
  }

  private processBuffer(isFinal = false) {
    // Delimiters for sentence boundaries: English '.', '!', '?', newlines, or Hindi '।'
    const sentenceRegex = /([^.!?।\n]+[.!?।\n]+)/g;
    let match;
    let lastIndex = 0;

    while ((match = sentenceRegex.exec(this.textBuffer)) !== null) {
      const sentence = match[1].trim();
      if (sentence) {
        this.enqueue(sentence);
      }
      lastIndex = sentenceRegex.lastIndex;
    }

    this.textBuffer = this.textBuffer.slice(lastIndex);

    if (isFinal && this.textBuffer.trim()) {
      this.enqueue(this.textBuffer.trim());
      this.textBuffer = '';
    }

    if (!this.isPlaying && this.queue.length > 0) {
      this.playNext();
    } else if (isFinal && !this.isPlaying && this.queue.length === 0) {
      if (this.onFinishedAll) this.onFinishedAll();
    }
  }

  private enqueue(sentence: string) {
    const clean = sentence
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#_~`>]/g, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean) {
      this.queue.push(clean);
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      if (this.textBuffer.length === 0 && this.onFinishedAll) {
        this.onFinishedAll();
      }
      return;
    }

    this.isPlaying = true;
    if (this.onStartPlaying) {
      this.onStartPlaying();
      this.onStartPlaying = undefined;
    }

    const sentence = this.queue.shift()!;

    try {
      await speakHindi(
        sentence,
        undefined,
        () => {
          setTimeout(() => {
            this.playNext();
          }, 35);
        },
        () => {
          this.playNext();
        }
      );
    } catch {
      this.playNext();
    }
  }

  public clear() {
    this.queue = [];
    this.textBuffer = '';
    this.isPlaying = false;
    stopSpeech();
  }
}

// Base64 Audio Playback helper
export function playBase64Audio(base64Data: string, mimeType = 'audio/mp3'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:${mimeType};base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (err) => reject(err);
      audio.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

export interface StreamAudioPlayerControls {
  stop: () => void;
}

/**
 * Stream-based Audio Player using Web Audio API buffer scheduling.
 * Plays chunks as soon as they arrive from the server readable stream.
 */
export async function playStreamedAudio(
  fetchResponse: Response,
  onStart?: () => void,
  onEnded?: () => void
): Promise<StreamAudioPlayerControls> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume().catch(() => {});
  }

  let nextStartTime = audioCtx.currentTime;
  const scheduledSources: AudioBufferSourceNode[] = [];
  let isStopped = false;
  let hasStarted = false;
  let activeChunksCount = 0;
  let isStreamFinished = false;

  const stop = () => {
    if (isStopped) return;
    isStopped = true;
    scheduledSources.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    scheduledSources.length = 0;
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
    if (onEnded) onEnded();
  };

  const checkCompletion = () => {
    if (isStreamFinished && activeChunksCount === 0 && !isStopped) {
      const remainingTimeMs = Math.max(0, (nextStartTime - audioCtx.currentTime) * 1000 + 150);
      setTimeout(() => {
        if (!isStopped) {
          stop();
        }
      }, remainingTimeMs);
    }
  };

  const decodeAndPlayChunk = async (base64Chunk: string) => {
    if (isStopped) return;
    try {
      const binaryString = atob(base64Chunk);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioCtx.decodeAudioData(bytes.buffer.slice(0), resolve, reject);
      });

      if (isStopped) return;

      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }

      activeChunksCount++;
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const startTime = Math.max(audioCtx.currentTime, nextStartTime);
      source.start(startTime);
      nextStartTime = startTime + audioBuffer.duration;

      scheduledSources.push(source);

      source.onended = () => {
        activeChunksCount--;
        const idx = scheduledSources.indexOf(source);
        if (idx !== -1) scheduledSources.splice(idx, 1);
        checkCompletion();
      };
    } catch (err) {
      console.warn('Failed to decode audio chunk:', err);
    }
  };

  const reader = fetchResponse.body?.getReader();
  if (!reader) {
    if (onEnded) onEnded();
    return { stop };
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  (async () => {
    try {
      while (!isStopped) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.audioChunk) {
                await decodeAndPlayChunk(data.audioChunk);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.warn('Stream reading error:', e);
    } finally {
      isStreamFinished = true;
      checkCompletion();
    }
  })();

  return { stop };
}

