import React, { useEffect, useRef } from 'react';
import { useVoiceVisualizer } from '../hooks/useVoiceVisualizer';
import { Mic, MicOff, Square, RefreshCw, Volume2, Download, Sparkles } from 'lucide-react';

export interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  hasError: boolean;
  liveSpeechText?: string;
  errorMessage?: string;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onRetry: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  hasError,
  liveSpeechText,
  errorMessage,
  onToggleListening,
  onStopSpeaking,
  onRetry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hook handles AudioContext, AnalyserNode, media tracks, 60fps refs, AbortController, and barge-in speech detection
  const { energyRef, timeRef, ringScaleRefs, ringOpacityRefs, ringRotations } =
    useVoiceVisualizer({
      isListening,
      isSpeaking,
      isThinking,
      hasError,
      onBargeInSpeech: onStopSpeaking,
    });

  // Canvas rendering animation loop (Central Blue Orb + 5 Narrow Glowing Blue Rings)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const time = timeRef.current;
      const energy = energyRef.current;

      // 5 Narrow Blue / Azure / Cyan rings
      const baseRadii = [62, 88, 118, 150, 182];

      for (let i = 0; i < 5; i++) {
        const scale = ringScaleRefs.current[i] || 1;
        const opacity = ringOpacityRefs.current[i] || 0.3;
        const rotation = (ringRotations.current[i] || 0) * (Math.PI / 180);

        const radius = baseRadii[i] * scale;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Styling for narrow glowing blue / azure / cyan rings
        ctx.globalAlpha = Math.max(0.08, Math.min(0.98, opacity));
        ctx.lineWidth = 1.8 + (4 - i) * 0.4; // Narrow crisp strokes

        const strokeGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
        if (hasError) {
          strokeGradient.addColorStop(0, '#F43F5E');
          strokeGradient.addColorStop(0.5, '#FB7185');
          strokeGradient.addColorStop(1, '#E11D48');
        } else {
          strokeGradient.addColorStop(0, '#2563EB'); // Royal Blue
          strokeGradient.addColorStop(0.5, '#38BDF8'); // Sky Cyan
          strokeGradient.addColorStop(1, '#1D4ED8'); // Deep Blue
        }

        ctx.strokeStyle = strokeGradient;
        ctx.shadowColor = hasError ? '#F43F5E' : '#38BDF8';
        ctx.shadowBlur = 12 + i * 4;

        // Draw curved soundwave arcs on Left and Right sides
        const arcSpan = Math.PI * 0.65; // ~117 degrees arc

        // Right side arc
        ctx.beginPath();
        for (let a = -arcSpan / 2; a <= arcSpan / 2; a += 0.04) {
          const wave = Math.sin(a * 4 + time * (2 + i) + i) * (7 * energy);
          const r = radius + wave;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (a === -arcSpan / 2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Left side arc
        ctx.beginPath();
        for (let a = Math.PI - arcSpan / 2; a <= Math.PI + arcSpan / 2; a += 0.04) {
          const wave = Math.sin(a * 4 + time * (2 + i) + i) * (7 * energy);
          const r = radius + wave;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (a === Math.PI - arcSpan / 2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [hasError]);

  // 1920×1080 Ultra HD PNG Export Handler
  const exportHighResPNG = () => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 1920;
    offCanvas.height = 1080;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1080;
    const cx = width / 2;
    const cy = height / 2;

    // 1. Dark ambient background gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, 1100);
    bgGrad.addColorStop(0, '#0f172a'); // Slate 900
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#030712'); // Dark gray/black
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw 5 narrow blue glowing rings (scaled up for 1080p)
    const baseRadii = [180, 260, 350, 440, 530];
    const time = timeRef.current;
    const energy = energyRef.current;

    for (let i = 0; i < 5; i++) {
      const scale = ringScaleRefs.current[i] || 1;
      const opacity = Math.max(0.2, ringOpacityRefs.current[i] || 0.5);
      const rotation = (ringRotations.current[i] || 0) * (Math.PI / 180);
      const radius = baseRadii[i] * scale;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      ctx.globalAlpha = opacity;
      ctx.lineWidth = 4 + (4 - i) * 1.2;

      const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
      gradient.addColorStop(0, '#2563EB');
      gradient.addColorStop(0.5, '#38BDF8');
      gradient.addColorStop(1, '#1D4ED8');

      ctx.strokeStyle = gradient;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 25 + i * 8;

      const arcSpan = Math.PI * 0.68;

      // Right arc
      ctx.beginPath();
      for (let a = -arcSpan / 2; a <= arcSpan / 2; a += 0.02) {
        const wave = Math.sin(a * 4 + time * (2 + i) + i) * (18 * Math.max(0.2, energy));
        const r = radius + wave;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === -arcSpan / 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Left arc
      ctx.beginPath();
      for (let a = Math.PI - arcSpan / 2; a <= Math.PI + arcSpan / 2; a += 0.02) {
        const wave = Math.sin(a * 4 + time * (2 + i) + i) * (18 * Math.max(0.2, energy));
        const r = radius + wave;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === Math.PI - arcSpan / 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    }

    // 3. Central Blue Orb (Glowing sphere at center)
    const orbRadius = 110;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = '#2563EB';
    ctx.shadowBlur = 50;

    const orbGrad = ctx.createRadialGradient(-30, -30, 10, 0, 0, orbRadius);
    orbGrad.addColorStop(0, '#60A5FA');
    orbGrad.addColorStop(0.4, '#2563EB');
    orbGrad.addColorStop(0.8, '#1D4ED8');
    orbGrad.addColorStop(1, '#0F172A');

    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
    ctx.fill();

    // Orb outer blue glow stroke
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38BDF8';
    ctx.stroke();

    ctx.restore();

    // 4. Branding & Watermark
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AETHERVOICE AI', cx, 90);

    ctx.fillStyle = '#60A5FA';
    ctx.font = '18px monospace';
    ctx.fillText('1920 × 1080 ULTRA HD VOICE-ORB CANVAS EXPORT', cx, 125);

    // Download trigger
    const link = document.createElement('a');
    link.download = `aethervoice-orb-1920x1080-${Date.now()}.png`;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
  };

  // Determine state title and subtitle
  let stateTitle = 'Tap to Speak';
  let stateSubtitle = 'Ask anything. I’m ready to help.';

  if (hasError) {
    stateTitle = 'Voice connection failed';
    stateSubtitle = errorMessage || 'Microphone error or permission denied.';
  } else if (isListening) {
    stateTitle = 'Listening…';
    stateSubtitle = liveSpeechText || 'Speak clearly into your microphone...';
  } else if (isThinking) {
    stateTitle = 'Thinking…';
    stateSubtitle = 'AetherVoice is generating your response...';
  } else if (isSpeaking) {
    stateTitle = 'AetherVoice is speaking…';
    stateSubtitle = 'Tap stop below or speak to barge-in & interrupt.';
  }

  const handleOrbClick = () => {
    if (hasError) {
      onRetry();
    } else if (isSpeaking) {
      onStopSpeaking();
    } else if (isListening) {
      onToggleListening();
    } else {
      onToggleListening();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none space-card-glass rounded-3xl p-4 sm:p-6 my-2 shadow-2xl w-full max-w-2xl mx-auto backdrop-blur-2xl">
      {/* Top Bar with Export 1080p Button */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs">
        <div className="flex items-center space-x-2 text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-[11px] tracking-wide uppercase text-purple-200 space-text-glow">
            AetherVoice Cosmic Orb Engine
          </span>
        </div>
        <button
          onClick={exportHighResPNG}
          className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-200 font-bold flex items-center space-x-1.5 transition-all text-[11px] shadow-sm"
          title="Export 1920×1080 PNG Visualizer Snapshot"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 1080p PNG</span>
        </button>
      </div>

      {/* Soundwave canvas + Central Blue Voice Orb */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
        {/* Animated Canvas for 5 Narrow Glowing Blue Rings */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Central Glowing Blue Voice Orb Button */}
        <button
          onClick={handleOrbClick}
          aria-label={stateTitle}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-purple-600 via-indigo-700 to-slate-900 border-2 transition-all duration-300 flex items-center justify-center group shadow-2xl focus:outline-none ${
            isListening
              ? 'border-purple-300 shadow-[0_0_50px_rgba(168,85,247,0.7)] scale-105'
              : isSpeaking
              ? 'border-cyan-300 shadow-[0_0_45px_rgba(56,189,248,0.7)] scale-105'
              : isThinking
              ? 'border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.5)] animate-pulse'
              : hasError
              ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)]'
              : 'border-purple-400/40 hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]'
          }`}
        >
          {/* Inner dark gradient ring */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-slate-900/90 to-purple-950/90 flex items-center justify-center">
            {hasError ? (
              <MicOff className="w-8 h-8 text-rose-400" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-cyan-300 animate-bounce" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-purple-300 animate-pulse" />
            ) : isThinking ? (
              <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white group-hover:text-purple-300 transition-colors" />
            )}
          </div>
        </button>
      </div>

      {/* Voice State Status Text */}
      <div className="mt-4 text-center space-y-1 z-10 max-w-sm px-4">
        <h3 className="text-lg font-bold text-white tracking-tight space-text-glow">{stateTitle}</h3>
        <p className="text-xs text-zinc-200 font-medium leading-relaxed min-h-[1.5rem] space-text-glow">
          {stateSubtitle}
        </p>
      </div>

      {/* Live Transcript Display Box */}
      {liveSpeechText && isListening && (
        <div className="mt-3 w-full max-w-md p-3 rounded-2xl bg-black/80 border border-purple-500/40 text-xs text-purple-200 font-mono flex items-center space-x-2 animate-fadeIn shadow-xl">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="font-bold text-white">Live Speech:</span>
          <span className="text-zinc-100 flex-1 truncate">{liveSpeechText}</span>
        </div>
      )}

      {/* Visible Stop Button when AI is Speaking */}
      {isSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="mt-4 px-5 py-2 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-200 hover:bg-rose-500/30 text-xs font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Speech (Or speak to barge-in)</span>
        </button>
      )}

      {/* Visible Try Again Button on Error */}
      {hasError && (
        <button
          onClick={onRetry}
          className="mt-4 px-5 py-2 rounded-full bg-purple-600/30 border border-purple-500/60 text-purple-200 hover:bg-purple-600/40 text-xs font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};


