import { useEffect, useRef } from 'react';

export interface UseVoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  hasError: boolean;
  onBargeInSpeech?: () => void; // Callback triggered when user speaks while AI is speaking
}

export function useVoiceVisualizer({
  isListening,
  isSpeaking,
  isThinking,
  hasError,
  onBargeInSpeech,
}: UseVoiceVisualizerProps) {
  // Store active flags in stateRef to avoid stale closures inside requestAnimationFrame
  const stateRef = useRef({ isListening, isSpeaking, isThinking, hasError, onBargeInSpeech });
  stateRef.current = { isListening, isSpeaking, isThinking, hasError, onBargeInSpeech };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Animation values stored in refs to allow 60fps rendering without React re-renders
  const energyRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const ringScaleRefs = useRef<number[]>([1, 1, 1, 1, 1]);
  const ringOpacityRefs = useRef<number[]>([0.2, 0.3, 0.4, 0.5, 0.6]);
  const ringRotations = useRef<number[]>([0, 0, 0, 0, 0]);

  // Handle Microphone Stream setup when isListening or isSpeaking (for barge-in)
  useEffect(() => {
    // Create new AbortController for stream initialization lifecycle
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function initMic() {
      // Initialize mic if user is listening OR if AI is speaking (to enable barge-in speech detection)
      if (!isListening && !isSpeaking) return;

      try {
        if (controller.signal.aborted) return;

        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          if (controller.signal.aborted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
        }

        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }

        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }

        if (!analyserRef.current && audioCtxRef.current && streamRef.current) {
          const source = audioCtxRef.current.createMediaStreamSource(streamRef.current);
          const analyser = audioCtxRef.current.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.75;
          source.connect(analyser);
          analyserRef.current = analyser;
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn('Microphone initialization failed:', err);
        }
      }
    }

    if (isListening || isSpeaking) {
      initMic();
    } else {
      // Clean up mic stream when idle/thinking without speech
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      analyserRef.current = null;
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.suspend().catch(() => {});
      }
    }

    return () => {
      controller.abort();
    };
  }, [isListening, isSpeaking]);

  // Main 60fps animation loop with state machine logic for ring parameters and barge-in
  useEffect(() => {
    let lastTime = performance.now();
    const freqData = new Uint8Array(64);
    let sustainedBargeInFrames = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeRef.current += dt;

      const { isListening, isSpeaking, isThinking, hasError, onBargeInSpeech } = stateRef.current;

      let targetEnergy = 0;

      // Sample real audio signal data from AnalyserNode
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) {
          sum += freqData[i];
        }
        const avg = sum / freqData.length;
        const currentMicEnergy = Math.min(1, avg / 110);

        if (isListening) {
          targetEnergy = currentMicEnergy;
        }

        // BARGE-IN DETECTION: Fade out AI audio when user speaks while AI is speaking
        if (isSpeaking && currentMicEnergy > 0.3) {
          sustainedBargeInFrames++;
          if (sustainedBargeInFrames > 5 && onBargeInSpeech) {
            console.log('[Barge-In] User speech detected while AI speaking! Fading out AI audio.');
            onBargeInSpeech();
            sustainedBargeInFrames = 0;
          }
        } else {
          sustainedBargeInFrames = Math.max(0, sustainedBargeInFrames - 1);
        }
      }

      if (isSpeaking && targetEnergy === 0) {
        targetEnergy = 0.50 + Math.sin(timeRef.current * 10) * 0.25 + Math.sin(timeRef.current * 16) * 0.15;
      } else if (isThinking) {
        targetEnergy = 0.25 + Math.sin(timeRef.current * 5) * 0.15;
      } else if (!isListening && !isSpeaking) {
        // Idle state breathing energy
        targetEnergy = 0.08 + Math.sin(timeRef.current * 1.5) * 0.05;
      }

      // Smooth energy using linear interpolation (lerp)
      energyRef.current += (targetEnergy - energyRef.current) * 0.22;

      // UX States ring parameters definition:
      // Ring Scale, Opacity, Brightness, and Speed
      for (let i = 0; i < 5; i++) {
        const speedMultiplier = (i + 1) * 0.8;
        const phaseOffset = i * 0.45;

        if (hasError) {
          // UX STATE 5: Error (Contracted, warning red, subtle static pulse)
          ringScaleRefs.current[i] = 0.95 + Math.sin(timeRef.current * 1.2 + i) * 0.02;
          ringOpacityRefs.current[i] = 0.45;
        } else if (isListening) {
          // UX STATE 2: Listening (Reactive scale 1.05-1.35, high brightness opacity 0.4-0.9, fast frequency wave)
          const ringVolBonus = energyRef.current * (1 + i * 0.35);
          ringScaleRefs.current[i] = 1 + ringVolBonus + Math.sin(timeRef.current * speedMultiplier * 2 + phaseOffset) * 0.08;
          ringOpacityRefs.current[i] = Math.min(0.95, 0.30 + energyRef.current * 0.65 + Math.sin(timeRef.current * 4 + i) * 0.1);
        } else if (isSpeaking) {
          // UX STATE 4: Speaking (Scale 1.10-1.40, radiant blue glow opacity 0.5-0.95, harmonic sine wave)
          const wave = Math.sin(timeRef.current * (8 + i * 2) + phaseOffset);
          ringScaleRefs.current[i] = 1.05 + energyRef.current * 0.35 + wave * 0.09;
          ringOpacityRefs.current[i] = 0.45 + Math.abs(wave) * 0.5;
        } else if (isThinking) {
          // UX STATE 3: Thinking (Orbital rotation 45 deg/sec, pulsing scale 0.95-1.10, shimmering opacity 0.3-0.6)
          ringRotations.current[i] += (i % 2 === 0 ? 1 : -1) * dt * (40 + i * 15);
          ringScaleRefs.current[i] = 1 + Math.sin(timeRef.current * 3 + i) * 0.08;
          ringOpacityRefs.current[i] = 0.30 + Math.sin(timeRef.current * 4 + i) * 0.25;
        } else {
          // UX STATE 1: Idle (Scale 1.0, opacity 0.15-0.25, slow 1.0x pulse)
          ringScaleRefs.current[i] = 1.0 + Math.sin(timeRef.current * 1.2 + i * 0.4) * 0.03;
          ringOpacityRefs.current[i] = 0.18 + Math.sin(timeRef.current * 1.5 + i) * 0.08;
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    energyRef,
    timeRef,
    ringScaleRefs,
    ringOpacityRefs,
    ringRotations,
  };
}

