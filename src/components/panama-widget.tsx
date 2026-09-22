"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import type { PanamaWeather } from "@/lib/weather";

const PANAMA_TZ = "America/Panama";
const DOT_COUNT = 650;
const TILT = 0.35; // fixed X-axis tilt, radians
const AUTO_SPEED = 0.0035; // radians per frame when idle

// Fibonacci sphere: evenly distributed unit vectors, computed once.
const SPHERE_POINTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const y = 1 - (i / (DOT_COUNT - 1)) * 2;
  const radiusAtY = Math.sqrt(1 - y * y);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return { x: Math.cos(theta) * radiusAtY, y, z: Math.sin(theta) * radiusAtY };
});

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(AUTO_SPEED);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size * 0.42;
    let frame: number;

    function draw() {
      if (!draggingRef.current) {
        rotationRef.current += velocityRef.current;
        // Ease drag momentum back to the steady auto-rotate speed.
        velocityRef.current += (AUTO_SPEED - velocityRef.current) * 0.02;
      }
      const rot = rotationRef.current;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);

      ctx!.clearRect(0, 0, size, size);

      // Soft glow behind the sphere.
      const glow = ctx!.createRadialGradient(center, center, radius * 0.2, center, center, radius * 1.15);
      glow.addColorStop(0, "rgba(212, 104, 43, 0.16)");
      glow.addColorStop(1, "rgba(212, 104, 43, 0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, size, size);

      const projected = SPHERE_POINTS.map(({ x, y, z }) => {
        // Rotate around Y (spin), then tilt around X for a 3/4 view.
        const x1 = x * cosR + z * sinR;
        const z1 = -x * sinR + z * cosR;
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;
        return { sx: center + x1 * radius, sy: center - y2 * radius, depth: z2 };
      }).sort((a, b) => a.depth - b.depth);

      for (const p of projected) {
        const t = (p.depth + 1) / 2; // 0 (far) .. 1 (near)
        const alpha = 0.12 + t * 0.75;
        const r = 0.7 + t * 1.5;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(38, 38, 35, ${alpha})`;
        ctx!.fill();
      }

      // Equator ring for a "tech" feel.
      ctx!.beginPath();
      ctx!.ellipse(center, center, radius, radius * Math.abs(sinT), 0, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(212, 104, 43, 0.35)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    rotationRef.current += dx * 0.012;
    velocityRef.current = dx * 0.012;
  }
  function handlePointerUp() {
    draggingRef.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="mx-auto block w-full max-w-[180px] cursor-grab touch-none active:cursor-grabbing"
      aria-label="Globo interactivo — arrastra para girar"
      role="img"
    />
  );
}

function PanamaClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTime(
        new Intl.DateTimeFormat("es-PA", { hour: "numeric", minute: "2-digit", timeZone: PANAMA_TZ }).format(
          new Date()
        )
      );
    }
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="flex items-center gap-1 rounded-full border border-ink/10 bg-white px-2.5 py-1 font-label text-xs text-ink/70">
      <Clock3 size={12} />
      {time ?? "--:--"}
    </span>
  );
}

export function PanamaWidget({ weather }: { weather: PanamaWeather | null }) {
  return (
    <div className="fixed right-8 top-24 z-10 hidden w-56 rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-lg backdrop-blur xl:block">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream">
          {BRAND_NAME.slice(0, 1)}
        </span>
        <PanamaClock />
      </div>

      <GlobeCanvas />

      <p className="mt-3 font-display text-sm font-bold text-ink">En vivo desde Panamá</p>
      <p className="mt-1 font-label text-xs text-ink/60">
        {weather
          ? `${weather.temperature}°C · Se siente ${weather.feelsLike}° · ${weather.description}`
          : "Ciudad de Panamá"}
      </p>
    </div>
  );
}
