"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { isLand } from "@/lib/land-mask";
import type { PanamaWeather } from "@/lib/weather";

const PANAMA_TZ = "America/Panama";
const PANAMA_LAT = 8.9824;
const PANAMA_LON = -79.5199;
const TILT = 0.32; // fixed X-axis tilt, radians
const AUTO_SPEED = 0.0028; // radians per frame when idle

function toVector(latDeg: number, lonDeg: number) {
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lonDeg * Math.PI) / 180;
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

// Lat/lon grid, longitude spacing widened near the poles (by 1/cos(lat)) so
// dots don't bunch up there. Land-only, so the globe reads as a map instead
// of a uniform dot sphere.
const LAT_STEP = 3.2;
const GLOBE_POINTS: { x: number; y: number; z: number }[] = [];
for (let lat = -88; lat <= 88; lat += LAT_STEP) {
  const lonStep = Math.min(12, LAT_STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.06));
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (isLand(lat, lon)) GLOBE_POINTS.push(toVector(lat, lon));
  }
}

const PANAMA_VECTOR = toVector(PANAMA_LAT, PANAMA_LON);
// Rotating by R shifts every point's effective longitude by +R, so this
// initial value centers Panama on the visible face.
const INITIAL_ROTATION = -(PANAMA_LON * Math.PI) / 180;

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(INITIAL_ROTATION);
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
    const radius = size * 0.46;
    let frame: number;
    let startTime: number | null = null;

    function project(rot: number, cosT: number, sinT: number, v: { x: number; y: number; z: number }) {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const x1 = v.x * cosR + v.z * sinR;
      const z1 = -v.x * sinR + v.z * cosR;
      const y2 = v.y * cosT - z1 * sinT;
      const z2 = v.y * sinT + z1 * cosT;
      return { sx: center + x1 * radius, sy: center - y2 * radius, depth: z2 };
    }

    function draw(now: number) {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;

      if (!draggingRef.current) {
        rotationRef.current += velocityRef.current;
        velocityRef.current += (AUTO_SPEED - velocityRef.current) * 0.02;
      }
      const rot = rotationRef.current;
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);

      ctx!.clearRect(0, 0, size, size);

      // Soft glow + sphere edge so the globe reads clearly over open ocean.
      const glow = ctx!.createRadialGradient(center, center, radius * 0.3, center, center, radius * 1.05);
      glow.addColorStop(0, "rgba(212, 104, 43, 0.10)");
      glow.addColorStop(1, "rgba(212, 104, 43, 0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(center, center, radius * 1.05, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(center, center, radius, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(38, 38, 35, 0.18)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      const projected = GLOBE_POINTS.map((v) => project(rot, cosT, sinT, v)).sort((a, b) => a.depth - b.depth);
      for (const p of projected) {
        const t = (p.depth + 1) / 2; // 0 (far) .. 1 (near)
        const alpha = 0.25 + t * 0.65;
        const r = 0.9 + t * 1.3;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(38, 38, 35, ${alpha})`;
        ctx!.fill();
      }

      // Pulsing marker for Panama.
      const marker = project(rot, cosT, sinT, PANAMA_VECTOR);
      if (marker.depth > -0.15) {
        const pulse = (Math.sin(elapsed / 450) + 1) / 2; // 0..1
        const haloR = 4 + pulse * 5;
        ctx!.beginPath();
        ctx!.arc(marker.sx, marker.sy, haloR, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(212, 43, 43, ${0.35 * (1 - pulse)})`;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(marker.sx, marker.sy, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = "#D42B2B";
        ctx!.fill();
      }

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
      width={260}
      height={260}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="mx-auto block w-full max-w-[220px] cursor-grab touch-none active:cursor-grabbing"
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
    <div className="fixed right-16 top-1/2 z-10 hidden w-64 -translate-y-1/2 rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-lg backdrop-blur xl:block">
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
