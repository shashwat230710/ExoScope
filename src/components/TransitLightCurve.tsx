import React, { useEffect, useRef } from 'react';

interface TransitLightCurveProps {
  depthPpm: number;
  durationHr: number;
  periodDays: number;
  radiusRe: number;
  starRadiusRsun: number;
  snr: number;
  isConfirmed: boolean;
}

export const TransitLightCurve: React.FC<TransitLightCurveProps> = ({
  depthPpm,
  durationHr,
  periodDays,
  radiusRe,
  starRadiusRsun,
  snr,
  isConfirmed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Deep-space dark palette
    const bgColor = '#0B1020';
    const gridColor = 'rgba(30, 41, 59, 0.7)';
    const textColor = '#8892B0';
    const curveColor = isConfirmed ? '#5EEAD4' : '#F87171'; // Teal for planet, Rose for false positive
    const pointColor = isConfirmed ? 'rgba(94, 234, 212, 0.5)' : 'rgba(248, 113, 113, 0.5)';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Padding
    const padX = 45;
    const padY = 25;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padY + (plotH / 4) * i;
      ctx.moveTo(padX, y);
      ctx.lineTo(padX + plotW, y);
    }
    for (let i = 0; i <= 6; i++) {
      const x = padX + (plotW / 6) * i;
      ctx.moveTo(x, padY);
      ctx.lineTo(x, padY + plotH);
    }
    ctx.stroke();

    // Compute dip geometry
    const dipFraction = depthPpm / 1000000;
    const maxDipDisplay = Math.max(0.002, dipFraction * 1.4);

    // Generate photometric light curve points
    const pointsCount = 120;
    const noiseLevel = Math.max(0.0001, (1 / (snr || 10)) * 0.002);
    const centerX = padX + plotW / 2;
    const halfWidthPx = plotW * 0.22;

    ctx.fillStyle = pointColor;
    for (let i = 0; i < pointsCount; i++) {
      const t = (i / (pointsCount - 1)) * 2 - 1;
      const x = centerX + t * (plotW * 0.45);
      
      const absDist = Math.abs(x - centerX);
      let dip = 0;
      if (absDist < halfWidthPx * 0.65) {
        dip = dipFraction;
      } else if (absDist < halfWidthPx) {
        const ramp = (halfWidthPx - absDist) / (halfWidthPx * 0.35);
        dip = dipFraction * Math.max(0, ramp);
      }

      const noise = (Math.sin(i * 37.1) * 0.5 + Math.cos(i * 19.3) * 0.5) * noiseLevel;
      const flux = 1.0 - dip + noise;

      const y = padY + ((1.0 - flux) / maxDipDisplay) * (plotH * 0.75) + 10;

      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Theoretical smoothed transit model curve
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = padX; x <= padX + plotW; x += 2) {
      const absDist = Math.abs(x - centerX);
      let dip = 0;
      if (absDist < halfWidthPx * 0.65) {
        dip = dipFraction;
      } else if (absDist < halfWidthPx) {
        const ramp = (halfWidthPx - absDist) / (halfWidthPx * 0.35);
        dip = dipFraction * Math.max(0, ramp);
      }
      const flux = 1.0 - dip;
      const y = padY + ((1.0 - flux) / maxDipDisplay) * (plotH * 0.75) + 10;
      if (x === padX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = textColor;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('1.000', padX - 8, padY + 14);
    const bottomFlux = (1.0 - dipFraction).toFixed(4);
    ctx.fillText(bottomFlux, padX - 8, padY + (plotH * 0.75) + 14);

    ctx.textAlign = 'center';
    ctx.fillText(`-${(durationHr / 2).toFixed(1)}h`, centerX - halfWidthPx, h - 8);
    ctx.fillText('0h (Mid-Transit)', centerX, h - 8);
    ctx.fillText(`+${(durationHr / 2).toFixed(1)}h`, centerX + halfWidthPx, h - 8);

  }, [depthPpm, durationHr, periodDays, radiusRe, starRadiusRsun, snr, isConfirmed]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#E6EAF5]">
          Photometric Transit Light Curve
        </span>
        <span className="font-mono text-[11px] text-teal-300">
          ΔF = {depthPpm.toLocaleString()} ppm ({((depthPpm / 1000000) * 100).toFixed(3)}% dip)
        </span>
      </div>

      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#1E293B] bg-[#0B1020] shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#8892B0]">
        <span>Stellar Flux vs. Time</span>
        <span>Duration: {durationHr.toFixed(1)} hrs · Period: {periodDays.toFixed(1)} days</span>
      </div>
    </div>
  );
};
