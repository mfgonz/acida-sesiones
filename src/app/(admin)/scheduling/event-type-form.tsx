"use client";

import { useState } from "react";
import type { EventType } from "@/lib/types";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 240];

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} h` : `${Math.floor(hours)}h${minutes % 60}`;
}

const NOTICE_UNIT_MINUTES = { minutes: 1, hours: 60, days: 1440 } as const;
type NoticeUnit = keyof typeof NOTICE_UNIT_MINUTES;

function inferNoticeUnit(totalMinutes: number): NoticeUnit {
  if (totalMinutes >= 1440 && totalMinutes % 1440 === 0) return "days";
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) return "hours";
  return "minutes";
}

export function EventTypeForm({
  action,
  eventType,
}: {
  action: (formData: FormData) => void;
  eventType?: EventType;
}) {
  const [locationType, setLocationType] = useState(eventType?.location_type ?? "google_meet");
  const [color, setColor] = useState(eventType?.color ?? "#DD7130");
  const [duration, setDuration] = useState(eventType?.duration_minutes ?? 30);

  const initialNoticeMinutes = eventType?.min_notice_minutes ?? 60;
  const initialNoticeUnit = inferNoticeUnit(initialNoticeMinutes);
  const [noticeUnit, setNoticeUnit] = useState<NoticeUnit>(initialNoticeUnit);
  const [noticeValue, setNoticeValue] = useState(initialNoticeMinutes / NOTICE_UNIT_MINUTES[initialNoticeUnit]);
  const noticeMinutes = noticeValue * NOTICE_UNIT_MINUTES[noticeUnit];

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div>
        <label className="lbl mb-2 block">Nombre</label>
        <input
          name="name"
          required
          defaultValue={eventType?.name}
          placeholder="ej. Sesión de lluvia de ideas"
          className="fld"
        />
      </div>

      <div>
        <label className="lbl mb-2 block">Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={eventType?.description}
          className="fld"
        />
      </div>

      <div>
        <label className="lbl mb-2 block">Duración</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`btn ${duration === d ? "btn-ink" : ""}`}
            >
              {formatDuration(d)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={5}
            step={5}
            name="duration_minutes"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
            className="fld !w-32"
          />
          <span className="text-base">minutos ({formatDuration(duration)})</span>
        </div>
      </div>

      <div>
        <label className="lbl mb-2 block">Ubicación</label>
        <select
          name="location_type"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value as typeof locationType)}
          className="fld"
        >
          <option value="google_meet">Google Meet</option>
          <option value="in_person">Presencial</option>
          <option value="phone">Llamada telefónica</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      <div>
        <label className="lbl mb-2 block">Color</label>
        <div className="flex items-center gap-2">
          {["#DD7130", "#4E628D", "#403F0E", "#F5EFA7", "#EAC5E6", "#AED2D3"].map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-8 w-8 rounded-full border border-ink transition ${
                color === swatch ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : ""
              }`}
              aria-label={`Usar color ${swatch}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 cursor-pointer border border-ink bg-cream p-0.5"
            aria-label="Color personalizado"
          />
        </div>
        <input type="hidden" name="color" value={color} />
      </div>

      <div>
        <label className="flex items-center gap-3 text-lg">
          <input
            type="checkbox"
            name="collect_project_details"
            defaultChecked={eventType?.collect_project_details ?? false}
            className="m-0 h-5 w-5 accent-ink"
          />
          Pedir nombre del proyecto/negocio + resumen
        </label>
        <p className="ml-8 mt-1 text-[13px] leading-[17px]">
          Agrega dos campos extra al formulario de reserva — ideal para una primera llamada exploratoria con clientes nuevos.
        </p>
      </div>

      <div>
        <label className="lbl mb-2 block">Se muestra en la página pública bajo</label>
        <select
          name="audience"
          defaultValue={eventType?.audience ?? "new"}
          className="fld"
        >
          <option value="new">&quot;Si quieres trabajar con nosotras&quot; (clientes nuevos o potenciales)</option>
          <option value="existing">&quot;Si ya trabajas con nosotras&quot; (clientes actuales)</option>
        </select>
      </div>

      {locationType !== "google_meet" && (
        <div>
          <label className="lbl mb-2 block">Detalles de ubicación</label>
          <input
            name="location_details"
            defaultValue={eventType?.location_details}
            placeholder={locationType === "phone" ? "¿Quién llama a quién?" : "Dirección o detalles"}
            className="fld"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl mb-2 block">Margen antes (min)</label>
          <input
            type="number"
            min={0}
            name="buffer_before_minutes"
            defaultValue={eventType?.buffer_before_minutes ?? 0}
            className="fld"
          />
        </div>
        <div>
          <label className="lbl mb-2 block">Margen después (min)</label>
          <input
            type="number"
            min={0}
            name="buffer_after_minutes"
            defaultValue={eventType?.buffer_after_minutes ?? 0}
            className="fld"
          />
        </div>
        <div>
          <label className="lbl mb-2 block">Aviso mínimo</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={noticeValue}
              onChange={(e) => setNoticeValue(Number(e.target.value) || 0)}
              className="fld"
            />
            <select
              value={noticeUnit}
              onChange={(e) => setNoticeUnit(e.target.value as NoticeUnit)}
              className="fld !w-auto"
            >
              <option value="minutes">min</option>
              <option value="hours">h</option>
              <option value="days">días</option>
            </select>
          </div>
          <input type="hidden" name="min_notice_minutes" value={noticeMinutes} />
        </div>
        <div>
          <label className="lbl mb-2 block">Horizonte de reserva (días)</label>
          <input
            type="number"
            min={1}
            name="booking_horizon_days"
            defaultValue={eventType?.booking_horizon_days ?? 60}
            className="fld"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-ink btn-lg">
        {eventType ? "Guardar cambios" : "Crear tipo de sesión"}
      </button>
    </form>
  );
}
