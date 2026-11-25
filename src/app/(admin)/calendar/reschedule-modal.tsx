"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { rescheduleBooking } from "./actions";

export function RescheduleModal({
  bookingId,
  username,
  slug,
  onClose,
}: {
  bookingId: string;
  username: string;
  slug: string;
  onClose: () => void;
}) {
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetch(`/api/availability?username=${username}&slug=${slug}&month=${format(month, "yyyy-MM")}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoading(false));
  }, [month, username, slug]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of slots) {
      const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(iso);
    }
    return map;
  }, [slots, timezone]);

  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const numDays = new Date(year, m + 1, 0).getDate();
    const firstDayOffset = (new Date(year, m, 1).getDay() + 6) % 7;
    const days: (string | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= numDays; d++) days.push(format(new Date(year, m, d), "yyyy-MM-dd"));
    return days;
  }, [month]);

  function handleConfirm() {
    if (!selectedSlot) return;
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await rescheduleBooking(bookingId, selectedSlot, reason);
        onClose();
      } catch (err) {
        setErrorMsg("No se pudo reprogramar. Por favor intenta de nuevo.");
      }
    });
  }

  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];
  const fmtTime = (iso: string) =>
    new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone }).format(new Date(iso));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-ink bg-cream p-6 text-ink sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-ink pb-[18px]">
          <div className="flex flex-col gap-2">
            <span className="lbl">[ Reprogramar ]</span>
            <h2 id="reschedule-title" className="font-display text-[32px] font-normal leading-[38px]">
              Reprogramar sesión
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="btn w-11 !px-0">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl capitalize">{format(month, "MMMM yyyy", { locale: es })}</p>
              <div className="flex gap-1.5">
                <button type="button" aria-label="Mes anterior" onClick={() => setMonth((m) => addMonths(m, -1))} className="btn w-11 !px-0">
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button type="button" aria-label="Mes siguiente" onClick={() => setMonth((m) => addMonths(m, 1))} className="btn w-11 !px-0">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <span key={d} className="lbl py-1 text-center">
                  {d}
                </span>
              ))}
              {daysInMonth.map((dateKey, i) => {
                if (!dateKey) return <span key={i} />;
                const hasSlots = (slotsByDate.get(dateKey)?.length ?? 0) > 0;
                const isSelected = selectedDate === dateKey;
                const dayNum = Number(dateKey.slice(-2));
                if (!hasSlots) {
                  return (
                    <span key={dateKey} className="flex h-11 items-center justify-center text-base text-[#6b6a5c]">
                      {dayNum}
                    </span>
                  );
                }
                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setSelectedSlot(null);
                    }}
                    className={`h-11 rounded-[4px] text-base transition-colors ${
                      isSelected ? "bg-ink text-cream" : "bg-celeste hover:bg-ink/80 hover:text-cream"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
            {loading && <p className="lbl text-ink/60">Cargando disponibilidad…</p>}
          </div>

          <div className="flex flex-col gap-2 sm:border-l sm:border-ink sm:pl-[18px]">
            <span className="lbl">
              {selectedDate
                ? new Intl.DateTimeFormat("es", { weekday: "long", month: "long", day: "numeric" }).format(
                    new Date(`${selectedDate}T12:00:00`)
                  )
                : "Elige un día"}
            </span>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {selectedDaySlots.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedSlot(iso)}
                  className={`h-11 shrink-0 rounded-[4px] border border-ink text-base transition-colors ${
                    selectedSlot === iso ? "bg-ink text-cream" : "hover:bg-bone"
                  }`}
                >
                  {fmtTime(iso)}
                </button>
              ))}
              {selectedDate && !selectedDaySlots.length && <p className="text-base">No hay horarios disponibles este día.</p>}
            </div>
            <span className="lbl mt-auto pt-2 text-ink/60">Horarios en {timezone}</span>
          </div>
        </div>

        <label className="mt-6 flex flex-col gap-2 border-t border-ink pt-6">
          <span className="lbl">Motivo del cambio (opcional)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ej. Surgió un conflicto con otra producción; ¡gracias por la flexibilidad!"
            className="fld !text-base"
          />
          <span className="lbl text-olive">El cliente lo verá en el email de reprogramación</span>
        </label>

        {errorMsg && <p className="mt-4 text-base text-terracotta">{errorMsg}</p>}

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-ink pt-[18px]">
          <button type="button" onClick={onClose} className="btn">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} disabled={!selectedSlot || isPending} className="btn btn-ink">
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Confirmar nuevo horario
          </button>
        </div>
      </div>
    </div>
  );
}
