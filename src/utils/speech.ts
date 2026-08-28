// Speech Recognition & Audio Processing Utility
import { VocalFeeling } from '../types';

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

// Global voice cache & precache loader
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const populateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {}
  };
  populateVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
}

// Helper to select the most natural, human-like female voice available
function getBestHumanVoice(effectiveLang: string, feeling: VocalFeeling, preferredName?: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length > 0 ? cachedVoices : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
  if (voices.length === 0) return undefined;

  const isHindi = effectiveLang.toLowerCase().startsWith('hi') || /[\u0900-\u097F]/.test(effectiveLang);
  const primaryLang = effectiveLang.split('-')[0].toLowerCase();

  // If a specific voice name was requested
  if (preferredName) {
    const matched = voices.find((v) => v.name.toLowerCase().includes(preferredName.toLowerCase()));
    if (matched) return matched;
  }

  if (isHindi) {
    // Priority order for natural female Hindi voices:
    // 1. Microsoft Swara (Natural Female)
    // 2. Google हिन्दी (Natural Female)
    // 3. Apple Kalpana / Lekha / Neerja (Female)
    // 4. Any Hindi voice marked Natural/Neural
    const femaleHindiVoice =
      voices.find((v) => v.name.includes('Swara') || v.name.toLowerCase().includes('swara')) ||
      voices.find((v) => v.name.includes('Google हिन्दी') || v.name.includes('Google hindi')) ||
      voices.find((v) => v.name.includes('Kalpana') || v.name.includes('Lekha') || v.name.includes('Neerja')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online') || v.name.includes('Female'))) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')) ||
      voices.find((v) => v.lang.toLowerCase() === 'en-in' && (v.name.includes('Female') || v.name.includes('Swara') || v.name.includes('Heera')));

    if (femaleHindiVoice) return femaleHindiVoice;
  }

  // Priority order for natural female English/International voices:
  // 1. Google US/UK English Female
  // 2. Microsoft Jenny / Aria / Steffan (Natural Female)
  // 3. Apple Samantha / Serena / Karen / Victoria / Moira
  const femaleKeywords = [
    'female',
    'swara',
    'jenny',
    'aria',
    'samantha',
    'serena',
    'karen',
    'victoria',
    'moira',
    'zira',
    'natural',
    'neural',
    'online',
    'google',
  ];

  // Try matching female natural voice in same language
  const matchedLangFemale = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(primaryLang) &&
      femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
  );
  if (matchedLangFemale) return matchedLangFemale;

  // Fallback to general female natural voice
  const anyFemaleNatural = voices.find((v) =>
    femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
  );
  if (anyFemaleNatural) return anyFemaleNatural;

  return voices.find((v) => v.lang.toLowerCase().startsWith(primaryLang)) || voices.find((v) => v.lang.toLowerCase().includes('en')) || voices[0];
}

// Text to speech playback helper (Web Speech API + Base64 Audio player)
export function playTextToSpeech(
  text: string,
  langCode = 'hi-IN',
  onEnded?: () => void,
  options?: { speed?: number; pitch?: number; vocalFeeling?: VocalFeeling; voiceName?: string }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnded) onEnded();
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {}

  // Strip code blocks, markdown tags, emojis, asterisks, brackets for natural, fluid human speech flow
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/\[REALTIME_DATA_NEEDED\]/g, '')
    .replace(/\[REALTIME_CONSULTATION\]/g, '')
    .replace(/[*#_~`>]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    if (onEnded) onEnded();
    return;
  }

  const isHindiText = /[\u0900-\u097F]/.test(cleanText);
  const effectiveLang = isHindiText ? 'hi-IN' : langCode;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = effectiveLang;

  const feeling = options?.vocalFeeling || 'natural';
  // Natural fast female voice defaults (speed ~1.08, pitch ~1.06)
  let pitch = options?.pitch || 1.06;
  let speed = options?.speed || 1.08;

  if (feeling === 'sad') {
    pitch = 0.88;
    speed = 0.85;
  } else if (feeling === 'warm') {
    pitch = 1.04;
    speed = 1.02;
  } else if (feeling === 'upbeat') {
    pitch = 1.12;
    speed = 1.15;
  } else if (feeling === 'calm') {
    pitch = 0.98;
    speed = 0.95;
  }

  utterance.rate = Math.max(0.5, Math.min(2.0, speed));
  utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

  const matchedVoice = getBestHumanVoice(effectiveLang, feeling, options?.voiceName);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnded) {
    utterance.onend = () => onEnded();
    utterance.onerror = () => onEnded();
  }

  window.speechSynthesis.speak(utterance);
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

  private playNext() {
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

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playNext();
      return;
    }

    const isHindiText = /[\u0900-\u097F]/.test(sentence);
    const effectiveLang = isHindiText ? 'hi-IN' : this.langCode;
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = effectiveLang;

    const feeling = this.options.vocalFeeling || 'natural';
    let pitch = this.options.pitch || 1.06;
    let speed = this.options.speed || 1.08;

    if (feeling === 'sad') {
      pitch = 0.88;
      speed = 0.85;
    } else if (feeling === 'warm') {
      pitch = 1.04;
      speed = 1.02;
    } else if (feeling === 'upbeat') {
      pitch = 1.12;
      speed = 1.15;
    } else if (feeling === 'calm') {
      pitch = 0.98;
      speed = 0.95;
    }

    utterance.rate = Math.max(0.5, Math.min(2.0, speed));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

    const matchedVoice = getBestHumanVoice(effectiveLang, feeling, this.options.voiceName);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      // Natural breath delay (90ms) between sentences for human-like cadence
      setTimeout(() => {
        this.playNext();
      }, 90);
    };

    utterance.onerror = () => {
      this.playNext();
    };

    window.speechSynthesis.speak(utterance);
  }

  public clear() {
    this.queue = [];
    this.textBuffer = '';
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
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

