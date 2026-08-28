import React, { useEffect, useRef } from 'react';
import spaceNebulaImg from '../assets/images/deep_space_nebula_1785502764430.jpg';
import spaceGalaxyImg from '../assets/images/cosmic_galaxy_core_1785502783074.jpg';

interface SpaceBackgroundProps {
  theme?: string;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ theme = 'deep-space' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create stars
    const starCount = Math.min(240, Math.floor((width * height) / 6000));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.4,
      alpha: Math.random(),
      speed: Math.random() * 0.025 + 0.008,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color:
        Math.random() > 0.85
          ? '#C084FC'
          : Math.random() > 0.65
          ? '#38BDF8'
          : Math.random() > 0.45
          ? '#F472B6'
          : '#F9FAFB',
    }));

    // Create Shooting Comets / Meteors
    const comets = Array.from({ length: 4 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.5),
      length: Math.random() * 80 + 50,
      speed: Math.random() * 8 + 4,
      dx: Math.random() * 3 + 4,
      dy: Math.random() * 2 + 2,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space theme colors
      let primaryGlow = 'rgba(168, 85, 247, 0.15)';
      let secondaryGlow = 'rgba(56, 189, 248, 0.12)';

      if (theme === 'nebula-violet') {
        primaryGlow = 'rgba(217, 70, 239, 0.18)';
        secondaryGlow = 'rgba(147, 51, 234, 0.15)';
      } else if (theme === 'cosmic-cyan') {
        primaryGlow = 'rgba(6, 182, 212, 0.18)';
        secondaryGlow = 'rgba(59, 130, 246, 0.14)';
      } else if (theme === 'supernova-gold') {
        primaryGlow = 'rgba(245, 158, 11, 0.18)';
        secondaryGlow = 'rgba(239, 68, 68, 0.12)';
      }

      // Draw background ambient gradient over space photo
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, primaryGlow);
      bgGrad.addColorStop(0.5, secondaryGlow);
      bgGrad.addColorStop(1, 'rgba(5, 5, 8, 0.65)');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Shooting Comets
      comets.forEach((c) => {
        c.x += c.dx;
        c.y += c.dy;

        if (c.x > width + 100 || c.y > height + 100) {
          c.x = Math.random() * (width * 0.5) - 200;
          c.y = Math.random() * (height * 0.3) - 100;
          c.length = Math.random() * 80 + 50;
          c.speed = Math.random() * 8 + 4;
        }

        const cometGrad = ctx.createLinearGradient(c.x, c.y, c.x - c.length, c.y - c.length * 0.5);
        cometGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        cometGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.6)');
        cometGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.length, c.y - c.length * 0.5);
        ctx.stroke();
      });

      // Draw & twinkle stars
      stars.forEach((s) => {
        s.alpha += s.speed * s.twinkleDir;
        if (s.alpha >= 0.95) s.twinkleDir = -1;
        if (s.alpha <= 0.1) s.twinkleDir = 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0.15, Math.min(1, s.alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const bgImg = theme === 'cosmic-cyan' ? spaceGalaxyImg : spaceNebulaImg;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07070a]">
      {/* Photorealistic Moving Space Background Image */}
      <img
        src={bgImg}
        alt="Real Moving Space Backdrop"
        className="absolute inset-0 w-full h-full object-cover opacity-75 animate-space-drift filter brightness-95 contrast-125 saturate-110 transform-gpu"
      />
      {/* Pulsing Nebular Glow Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-blue-900/25 animate-cosmic-pulsar mix-blend-screen" />

      {/* Animated Stars, Comets & Cosmic Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-95 transition-opacity duration-1000"
      />
    </div>
  );
};


