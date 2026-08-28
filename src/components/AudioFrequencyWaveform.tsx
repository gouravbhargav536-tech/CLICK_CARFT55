import React, { useEffect, useRef, useState } from 'react';
import { Activity, Mic, Volume2, Sparkles, Sliders } from 'lucide-react';

interface AudioFrequencyWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  audioVolume: number;
  frequencyData?: Uint8Array | number[];
}

export const AudioFrequencyWaveform: React.FC<AudioFrequencyWaveformProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  audioVolume,
  frequencyData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [waveMode, setWaveMode] = useState<'bars' | 'wave' | 'mirror'>('bars');

  // Keep latest props in a ref for the animation loop
  const propsRef = useRef({ isListening, isSpeaking, isThinking, audioVolume, frequencyData, waveMode });
  useEffect(() => {
    propsRef.current = { isListening, isSpeaking, isThinking, audioVolume, frequencyData, waveMode };
  }, [isListening, isSpeaking, isThinking, audioVolume, frequencyData, waveMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const barCount = 48;

    const render = () => {
      const { isListening, isSpeaking, isThinking, audioVolume, frequencyData, waveMode } = propsRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Determine frequency values array
      let freqs: number[] = new Array(barCount).fill(4);

      if (isListening && frequencyData && frequencyData.length > 0) {
        const step = Math.floor(frequencyData.length / barCount) || 1;
        for (let i = 0; i < barCount; i++) {
          const index = Math.min(i * step, frequencyData.length - 1);
          freqs[i] = (frequencyData[index] / 255) * height * 0.85;
        }
      } else if (isListening) {
        // Fallback live microphone noise oscillation based on volume
        const time = Date.now() * 0.008;
        for (let i = 0; i < barCount; i++) {
          const base = (audioVolume / 100) * (height * 0.7);
          const sine = Math.sin(time + i * 0.3) * (base * 0.4);
          freqs[i] = Math.max(4, base + sine + Math.random() * 6);
        }
      } else if (isSpeaking) {
        // Synthetic output audio waveform
        const time = Date.now() * 0.01;
        for (let i = 0; i < barCount; i++) {
          const wave1 = Math.sin(time + i * 0.2) * 20;
          const wave2 = Math.cos(time * 1.5 + i * 0.15) * 15;
          freqs[i] = Math.max(6, 25 + wave1 + wave2);
        }
      } else if (isThinking) {
        // Pulse breathing effect for AI processing
        const time = Date.now() * 0.005;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(time + i * 0.1) * 12 + 16;
          freqs[i] = Math.max(4, wave);
        }
      } else {
        // Idle minimal ambient hum
        const time = Date.now() * 0.002;
        for (let i = 0; i < barCount; i++) {
          freqs[i] = Math.max(3, Math.sin(time + i * 0.4) * 3 + 5);
        }
      }

      const barWidth = (width / barCount) * 0.68;
      const barGap = (width - barWidth * barCount) / (barCount + 1);

      if (waveMode === 'bars') {
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.max(3, freqs[i]);
          const x = barGap + i * (barWidth + barGap);
          const y = height - barHeight;

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          if (isListening) {
            gradient.addColorStop(0, '#555555');
            gradient.addColorStop(1, '#ffffff');
          } else if (isSpeaking) {
            gradient.addColorStop(0, '#888888');
            gradient.addColorStop(1, '#ffffff');
          } else if (isThinking) {
            gradient.addColorStop(0, '#444444');
            gradient.addColorStop(1, '#aaaaaa');
          } else {
            gradient.addColorStop(0, '#222222');
            gradient.addColorStop(1, '#444444');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Glowing top cap
          if (barHeight > 10) {
            ctx.fillStyle = isListening ? '#ffffff' : isSpeaking ? '#eeeeee' : '#bbbbbb';
            ctx.beginPath();
            ctx.roundRect(x, y - 2, barWidth, 2, [1, 1, 1, 1]);
            ctx.fill();
          }
        }
      } else if (waveMode === 'mirror') {
        const centerY = height / 2;
        for (let i = 0; i < barCount; i++) {
          const halfHeight = Math.max(2, freqs[i] / 2);
          const x = barGap + i * (barWidth + barGap);

          const gradient = ctx.createLinearGradient(0, centerY - halfHeight, 0, centerY + halfHeight);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.5, '#777777');
          gradient.addColorStop(1, '#ffffff');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - halfHeight, barWidth, halfHeight * 2, [3, 3, 3, 3]);
          ctx.fill();
        }
      } else if (waveMode === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let i = 0; i < barCount; i++) {
          const x = barGap + i * (barWidth + barGap) + barWidth / 2;
          const y = height / 2 - (freqs[i] - 10) * Math.sin((i / barCount) * Math.PI);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height / 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isListening ? '#ffffff' : isSpeaking ? '#dddddd' : '#aaaaaa';
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Calculate approximate dB for meter
  const dbValue = isListening
    ? Math.max(-60, Math.round((audioVolume / 100) * 60 - 60))
    : -60;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-xl border transition-colors ${
              isListening
                ? 'bg-neutral-800 border-white text-white'
                : isSpeaking
                ? 'bg-white border-white text-black'
                : isThinking
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            {isListening ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : isThinking ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-300 tracking-widest uppercase flex items-center space-x-2">
              <span>Frequency Analyzer</span>
              <span className="text-[10px] text-neutral-500 font-mono">128 BINS</span>
            </h4>
            <p className="text-[10px] text-neutral-500 font-medium tracking-wide">
              {isListening
                ? 'LIVE MICROPHONE SPECTRUM ACTIVE'
                : isSpeaking
                ? 'SYNTHESIZING AUDIO OUTPUT WAVEFORM'
                : isThinking
                ? 'AI NEURAL NETWORK PROCESSING'
                : 'AUDIO STREAM IDLE'}
            </p>
          </div>
        </div>

        {/* Real-time dB Meter & Mode Selector */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-xl text-xs font-mono">
            <span className="text-neutral-500">LVL:</span>
            <span
              className={`font-bold ${
                dbValue > -10
                  ? 'text-white'
                  : dbValue > -30
                  ? 'text-neutral-300'
                  : 'text-neutral-500'
              }`}
            >
              {dbValue} dB
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setWaveMode('bars')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                waveMode === 'bars'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setWaveMode('mirror')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                waveMode === 'mirror'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Mirror
            </button>
            <button
              onClick={() => setWaveMode('wave')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                waveMode === 'wave'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Wave
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Waveform Display */}
      <div className="w-full bg-[#000000] rounded-2xl border border-neutral-800 p-2 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={80}
          className="w-full h-20 block rounded-xl"
        />

        {/* Ambient Overlay Grid Lines */}
        <div className="absolute inset-0 pointer-events-none border-b border-neutral-800/50 flex justify-between px-4 opacity-30">
          <div className="border-r border-neutral-700 h-full w-0" />
          <div className="border-r border-neutral-700 h-full w-0" />
          <div className="border-r border-neutral-700 h-full w-0" />
          <div className="border-r border-neutral-700 h-full w-0" />
        </div>
      </div>
    </div>
  );
};
