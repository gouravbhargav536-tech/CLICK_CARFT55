import React, { useRef, useEffect, useState } from 'react';
import { VisualizerPreset } from '../types';
import { Sparkles, Mic, Volume2, Radio, Layers, Zap, Waves } from 'lucide-react';

interface InteractiveOrbVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  audioVolume: number;
  preset: VisualizerPreset;
  onPresetChange: (preset: VisualizerPreset) => void;
  onOrbClick: () => void;
  statusText?: string;
  sourceLangName?: string;
  targetLangName?: string;
}

export const InteractiveOrbVisualizer: React.FC<InteractiveOrbVisualizerProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  audioVolume,
  preset = 'quantum',
  onPresetChange,
  onOrbClick,
  statusText,
  sourceLangName,
  targetLangName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  // Keep latest props in a ref for the animation loop
  const propsRef = useRef({ isListening, isSpeaking, isThinking, audioVolume, preset });
  useEffect(() => {
    propsRef.current = { isListening, isSpeaking, isThinking, audioVolume, preset };
  }, [isListening, isSpeaking, isThinking, audioVolume, preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;
    let wavePhase = 0;

    // Handle high DPI crisp rendering
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Particle system data
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * (canvas.clientWidth || 600),
      y: Math.random() * (canvas.clientHeight || 400),
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      hue: Math.random() * 60 + 180, // Cyan to Violet
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      const { isListening, isSpeaking, isThinking, audioVolume, preset } = propsRef.current;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 400;
      const centerX = width / 2;
      const centerY = height / 2;

      // Deep dark pitch-black background
      ctx.fillStyle = '#000000'; // Pure black
      ctx.fillRect(0, 0, width, height);

      rotationAngle += 0.012 + (audioVolume / 1800);
      wavePhase += 0.035 + (audioVolume / 1200);

      const normVolume = Math.min(1, audioVolume / 75);
      const baseRadius = 75 + normVolume * 35;

      // --- HIGH GRAPHICS HIGH-CONTRAST CONCENTRIC WAVE ANIMATION ---
      // Concentric pulsating ripple ring acoustic waves radiating from central orb
      const waveCount = 8;
      for (let w = 0; w < waveCount; w++) {
        const ringOffset = ((wavePhase * 40 + w * 32) % 240);
        const ringRadius = baseRadius + ringOffset;
        const fadeAlpha = Math.max(0, 1 - ringRadius / (Math.min(width, height) * 0.48));

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);

        // Premium monochrome aesthetic with subtle visual feedback
        let waveOpacity = fadeAlpha * (0.3 + normVolume * 0.5);
        let waveColor = `rgba(255, 255, 255, ${waveOpacity})`;
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 1 + (1 - ringRadius / 240) * 1.5;

        // Glowing wave edge rim
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4 * fadeAlpha;

        ctx.stroke();
        ctx.restore();
      }

      // --- CENTRAL CORE ---
      if (preset === 'quantum') {
        // Outer orbital ring waves (subtle geometric rings)
        for (let ring = 0; ring < 3; ring++) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(rotationAngle * (ring % 2 === 0 ? 1 : -1) + ring * 1.2);

          ctx.beginPath();
          ctx.ellipse(0, 0, baseRadius + ring * 12, (baseRadius + ring * 12) * 0.9, ring * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - ring * 0.03})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 8]);
          ctx.stroke();
          ctx.restore();
        }

        // Central fluid dark sphere core with vibrant crest gradient
        ctx.beginPath();
        const numPoints = 72;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const offset = Math.sin(angle * 5 + wavePhase * 2.5) * (6 + normVolume * 24) +
                         Math.cos(angle * 3 - wavePhase * 1.5) * (4 + normVolume * 16);
          const r = baseRadius + offset;
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const orbGradient = ctx.createRadialGradient(
          centerX - baseRadius * 0.3,
          centerY - baseRadius * 0.3,
          10,
          centerX,
          centerY,
          baseRadius * 1.2
        );

        if (isListening) {
          orbGradient.addColorStop(0, '#ffffff');
          orbGradient.addColorStop(0.3, '#aaaaaa');
          orbGradient.addColorStop(0.8, '#111111');
          orbGradient.addColorStop(1, '#000000');
        } else if (isSpeaking) {
          orbGradient.addColorStop(0, '#ffffff');
          orbGradient.addColorStop(0.3, '#777777');
          orbGradient.addColorStop(0.8, '#111111');
          orbGradient.addColorStop(1, '#000000');
        } else if (isThinking) {
          orbGradient.addColorStop(0, '#dddddd');
          orbGradient.addColorStop(0.3, '#555555');
          orbGradient.addColorStop(0.8, '#111111');
          orbGradient.addColorStop(1, '#000000');
        } else {
          orbGradient.addColorStop(0, '#cccccc');
          orbGradient.addColorStop(0.3, '#333333');
          orbGradient.addColorStop(0.8, '#0a0a0a');
          orbGradient.addColorStop(1, '#000000');
        }

        ctx.fillStyle = orbGradient;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20 + normVolume * 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- PRESET 2: LIQUID HOLOGRAPHIC WAVES ---
      else if (preset === 'liquid') {
        for (let wave = 0; wave < 5; wave++) {
          ctx.beginPath();
          ctx.moveTo(0, centerY);

          const amplitude = (18 + normVolume * 60) * (1 - wave * 0.18);
          const frequency = 0.008 + wave * 0.003;

          for (let x = 0; x <= width; x += 6) {
            const y = centerY + Math.sin(x * frequency + wavePhase * 1.5 + wave * 0.8) * amplitude * Math.sin((x / width) * Math.PI);
            ctx.lineTo(x, y);
          }

          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - wave * 0.15})`;
          ctx.lineWidth = 2.5 - wave * 0.4;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // --- PRESET 3: RADIAL AUDIO SPECTRUM ---
      else if (preset === 'spectrum') {
        const bars = 56;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2;
          const h = 18 + Math.sin(i * 0.45 + wavePhase * 3) * 22 + normVolume * 75;
          const innerR = 75;
          const outerR = innerR + h;

          const x1 = centerX + Math.cos(angle) * innerR;
          const y1 = centerY + Math.sin(angle) * innerR;
          const x2 = centerX + Math.cos(angle) * outerR;
          const y2 = centerY + Math.sin(angle) * outerR;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + normVolume * 0.5})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // --- PRESET 4: CONSTELLATION PARTICLES ---
      else if (preset === 'particles') {
        particles.forEach((p, idx) => {
          p.x += p.vx * (1 + normVolume * 2);
          p.y += p.vy * (1 + normVolume * 2);

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + normVolume * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();

          // Connect nearby particles
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 90) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 90) * 0.3})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      }

      // Draw touch interaction ripples
      ripplesRef.current = ripplesRef.current
        .map((r) => ({ ...r, radius: r.radius + 4, alpha: r.alpha - 0.02 }))
        .filter((r) => r.alpha > 0);

      ripplesRef.current.forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripplesRef.current.push({ x, y, radius: 10, alpha: 0.95 });
    }
    onOrbClick();
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] flex flex-col items-center justify-center rounded-3xl bg-[#000000] border border-neutral-900 shadow-2xl overflow-hidden group select-none">
      {/* Top preset selection pills */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-1.5 bg-neutral-950/80 border border-neutral-800/80 rounded-full p-1 shadow-2xl backdrop-blur-md">
          {(['quantum', 'liquid', 'spectrum', 'particles'] as VisualizerPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => onPresetChange(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 capitalize flex items-center space-x-1.5 ${
                preset === p
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {p === 'quantum' && <Waves className="w-3.5 h-3.5" />}
              {p === 'liquid' && <Layers className="w-3.5 h-3.5" />}
              {p === 'spectrum' && <Volume2 className="w-3.5 h-3.5" />}
              {p === 'particles' && <Sparkles className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{p}</span>
            </button>
          ))}
        </div>

        {/* Translation route badge */}
        {sourceLangName && targetLangName && (
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800/80 text-neutral-300 shadow-xl backdrop-blur-md">
            <span>{sourceLangName}</span>
            <span className="text-neutral-600">➔</span>
            <span>{targetLangName}</span>
          </div>
        )}
      </div>

      {/* Main High-Graphics Canvas rendering 3D interactive wave animations */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer z-10 transition-transform duration-300 group-hover:scale-[1.005]"
      />

      {/* Center Interactive Orb Touch Trigger Overlay */}
      <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
        <button
          onClick={onOrbClick}
          className={`pointer-events-auto relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-500 transform active:scale-95 shadow-2xl ${
            isListening
              ? 'bg-neutral-900 border border-white text-white shadow-[0_0_40px_rgba(255,255,255,0.4)] ring-4 ring-white/10 animate-pulse'
              : isSpeaking
              ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.6)] ring-4 ring-white/30'
              : isThinking
              ? 'bg-neutral-900 border border-neutral-600 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse'
              : 'bg-black text-neutral-400 border border-neutral-800 shadow-2xl hover:scale-105 hover:border-neutral-500 hover:text-white'
          }`}
        >
          {isListening ? (
            <Mic className="w-10 h-10 animate-pulse text-white drop-shadow-md" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10 animate-bounce text-black drop-shadow-md" />
          ) : isThinking ? (
            <Zap className="w-10 h-10 animate-spin text-white drop-shadow-md" />
          ) : (
            <Mic className="w-10 h-10 transition-colors" />
          )}

          {/* Halo ring pulse */}
          <span
            className={`absolute -inset-3 rounded-full border border-white/20 transition-all duration-700 ${
              isListening ? 'animate-ping opacity-100' : 'opacity-0'
            }`}
          />
        </button>

        {/* Status text label */}
        <div className="mt-6 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-300 drop-shadow-md flex items-center justify-center space-x-1.5">
            <span>
              {statusText || (isListening ? 'Listening...' : isThinking ? 'Processing...' : isSpeaking ? 'Speaking...' : 'Touch to Speak')}
            </span>
          </p>
          <p className="text-[10px] text-neutral-500 mt-2 font-medium tracking-wide">
            {isListening
              ? 'ACOUSTIC WAVE ANALYSIS ACTIVE'
              : 'VOICE COMMANDS READY'}
          </p>
        </div>
      </div>
    </div>
  );
};

