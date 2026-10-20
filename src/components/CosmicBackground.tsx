import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Generate static stars with varying brightness and colors
    interface Star {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
    }

    const starCount = Math.min(180, Math.floor((width * height) / 8000));
    const starColors = ['#5EEAD4', '#93C5FD', '#E0E7FF', '#FCD34D', '#FFFFFF', '#C084FC'];
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.7;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.4,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: 0.005 + Math.random() * 0.02,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      size: number;
      angle: number;
      active: boolean;
      life: number;
      maxLife: number;
    }

    let shootingStar: ShootingStar | null = null;
    let nextShootingStarTime = Date.now() + 3000 + Math.random() * 5000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.2, 50,
        width * 0.5, height * 0.5, Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0c142c');
      bgGrad.addColorStop(0.5, '#080d1e');
      bgGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula clouds
      const nebula1 = ctx.createRadialGradient(width * 0.15, height * 0.35, 10, width * 0.15, height * 0.35, 400);
      nebula1.addColorStop(0, 'rgba(94, 234, 212, 0.04)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.85, height * 0.65, 10, width * 0.85, height * 0.65, 500);
      nebula2.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Draw and twinkle stars
      const now = Date.now();
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha = star.baseAlpha + Math.sin(now * star.twinkleSpeed + i) * 0.25;
        if (star.alpha < 0.1) star.alpha = 0.1;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting star management
      if (!shootingStar && now > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          len: 60 + Math.random() * 60,
          speed: 9 + Math.random() * 6,
          size: 1.2,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3,
          active: true,
          life: 0,
          maxLife: 45
        };
      }

      if (shootingStar && shootingStar.active) {
        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.life++;

        const progress = shootingStar.life / shootingStar.maxLife;
        const currentAlpha = Math.sin(progress * Math.PI) * 0.8;

        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.len;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.len;

        const shootGrad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        shootGrad.addColorStop(0, 'transparent');
        shootGrad.addColorStop(1, 'rgba(94, 234, 212, 0.9)');

        ctx.strokeStyle = shootGrad;
        ctx.lineWidth = shootingStar.size;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.stroke();

        if (shootingStar.life >= shootingStar.maxLife || shootingStar.x > width || shootingStar.y > height) {
          shootingStar = null;
          nextShootingStarTime = now + 4000 + Math.random() * 8000;
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
