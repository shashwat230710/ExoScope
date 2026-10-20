import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Orbit } from 'lucide-react';

interface TransitOrreryProps {
  orbitalPeriodDays: number;
  transitDurationHr: number;
  planetRadiusRe: number;
  starRadiusRsun: number;
  impactParameter: number; // b: 0 to 1.5+
  transitDepthPpm: number;
  isConfirmed: boolean;
}

export const TransitOrrery: React.FC<TransitOrreryProps> = ({
  orbitalPeriodDays,
  transitDurationHr,
  planetRadiusRe,
  starRadiusRsun,
  impactParameter,
  transitDepthPpm,
  isConfirmed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0.5); // 0 to 1 along transit path (0.5 = mid-transit)
  const isDraggingRef = useRef(false);

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localProgress = progress;

    const render = () => {
      if (isPlaying && !isDraggingRef.current) {
        // Increment progress (complete cycle in ~8 seconds at 1x)
        localProgress = (localProgress + 0.002 * speed) % 1.0;
        setProgress(localProgress);
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Deep space backdrop
      ctx.fillStyle = '#070B16';
      ctx.fillRect(0, 0, w, h);

      // Star center and size
      const starCenterX = w * 0.5;
      const starCenterY = h * 0.48;
      const starRadiusPx = Math.min(w, h) * 0.28;

      // Draw subtle orbital transit guide line (chord)
      // Impact parameter b shifts transit line vertically from center:
      // b = 0 -> center; b = 1 -> grazing edge; b > 1 -> misses disk
      const clampedB = Math.max(0, Math.min(1.4, impactParameter));
      const transitY = starCenterY - (clampedB * starRadiusPx * 0.85);

      // Draw transit chord guide
      ctx.strokeStyle = clampedB > 1.0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(94, 234, 212, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w * 0.08, transitY);
      ctx.lineTo(w * 0.92, transitY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Star with Corona and Limb Darkening
      // Outer glow / corona
      const coronaGrad = ctx.createRadialGradient(
        starCenterX, starCenterY, starRadiusPx * 0.8,
        starCenterX, starCenterY, starRadiusPx * 1.6
      );
      coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      coronaGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(starCenterX, starCenterY, starRadiusPx * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Stellar surface with limb darkening (darker at rim)
      const starGrad = ctx.createRadialGradient(
        starCenterX - starRadiusPx * 0.2, starCenterY - starRadiusPx * 0.2, starRadiusPx * 0.1,
        starCenterX, starCenterY, starRadiusPx
      );
      starGrad.addColorStop(0, '#FFFBEB');
      starGrad.addColorStop(0.4, '#FDE68A');
      starGrad.addColorStop(0.8, '#F59E0B');
      starGrad.addColorStop(1, '#B45309');

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(starCenterX, starCenterY, starRadiusPx, 0, Math.PI * 2);
      ctx.fill();

      // Star boundary ring
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate Planet position along transit chord
      // localProgress = 0 (left entrance) to 1 (right exit)
      const transitStartX = w * 0.10;
      const transitEndX = w * 0.90;
      const planetX = transitStartX + localProgress * (transitEndX - transitStartX);
      const planetY = transitY;

      // Planet physical radius relative to star
      // Earth radius is ~0.009 R_sun. Jupiter is ~0.10 R_sun.
      const radiusRatio = Math.max(0.04, Math.min(0.35, (planetRadiusRe / (starRadiusRsun * 109.2)) * 3.5));
      const planetRadiusPx = Math.max(5, starRadiusPx * radiusRatio);

      // Check if planet is in front of star disk
      const distFromStarCenter = Math.hypot(planetX - starCenterX, planetY - starCenterY);
      const isInTransit = distFromStarCenter < (starRadiusPx + planetRadiusPx);

      // Draw Planet silhouette
      // When transiting in front of star, appears as a black / dark silhouette with atmosphere rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetRadiusPx, 0, Math.PI * 2);
      ctx.fillStyle = '#05070E';
      ctx.fill();

      // Atmospheric glowing rim if confirmed planet
      ctx.strokeStyle = isConfirmed ? 'rgba(94, 234, 212, 0.7)' : 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = Math.max(1.2, planetRadiusPx * 0.15);
      ctx.stroke();
      ctx.restore();

      // Impact Parameter label annotation
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Transit Chord: b = ${impactParameter.toFixed(2)}`, w * 0.10, transitY - 8);

      if (clampedB > 1.0) {
        ctx.fillStyle = '#F43F5E';
        ctx.fillText('⚠ Grazing edge (b > 1.0)', w * 0.10 + 130, transitY - 8);
      } else if (clampedB <= 0.3) {
        ctx.fillStyle = '#2DD4BF';
        ctx.fillText('✓ Central Transit', w * 0.10 + 130, transitY - 8);
      }

      // Transit Phase status at bottom
      ctx.textAlign = 'center';
      if (isInTransit) {
        ctx.fillStyle = isConfirmed ? '#2DD4BF' : '#F43F5E';
        ctx.font = '11px sans-serif';
        const depthPct = (transitDepthPpm / 10000).toFixed(2);
        ctx.fillText(`● IN TRANSIT: Starlight dimmed by ${depthPct}% (${transitDepthPpm.toLocaleString()} ppm)`, w * 0.5, h - 14);
      } else {
        ctx.fillStyle = '#64748B';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Out of Transit: Full 100% Stellar Flux Baseline`, w * 0.5, h - 14);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, speed, impactParameter, planetRadiusRe, starRadiusRsun, transitDepthPpm, isConfirmed]);

  return (
    <div className="rounded-xl bg-[#0B1020]/90 border border-[#1E293B] overflow-hidden flex flex-col">
      {/* Visual Canvas */}
      <div className="relative w-full h-52 sm:h-60 bg-[#070B16]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-ew-resize"
          onMouseDown={() => (isDraggingRef.current = true)}
          onMouseUp={() => (isDraggingRef.current = false)}
          onMouseLeave={() => (isDraggingRef.current = false)}
          onMouseMove={(e) => {
            if (!isDraggingRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            setProgress(Math.max(0, Math.min(1, relX)));
          }}
        />

        {/* Overlay Telemetry Badges */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-mono text-teal-300 backdrop-blur-xs">
            <Orbit className="w-3 h-3 text-teal-400" />
            LIVE ORBIT SIMULATOR
          </span>
        </div>

        <div className="absolute top-2.5 right-3 text-right">
          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded backdrop-blur-xs">
            Host: {starRadiusRsun.toFixed(2)} R☉ | Planet: {planetRadiusRe.toFixed(2)} R⊕
          </span>
        </div>
      </div>

      {/* Scrub & Control Toolbar */}
      <div className="p-3 bg-[#0F172A] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 transition-all cursor-pointer flex items-center gap-1 font-medium"
            title={isPlaying ? 'Pause transit' : 'Resume transit'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setProgress(0.5)}
            className="p-1.5 rounded-lg bg-[#182346] text-[#8892B0] hover:text-white border border-[#1E293B] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Jump to Mid-Transit"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Center Transit</span>
          </button>
        </div>

        {/* Phase Scrub Slider */}
        <div className="flex-1 min-w-44 flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#8892B0]">Ingress</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={progress}
            onChange={(e) => {
              isDraggingRef.current = true;
              setProgress(parseFloat(e.target.value));
              setTimeout(() => { isDraggingRef.current = false; }, 200);
            }}
            className="w-full h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <span className="text-[10px] font-mono text-[#8892B0]">Egress</span>
        </div>

        {/* Speed toggle */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#8892B0]">
          <span>Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                speed === s ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
