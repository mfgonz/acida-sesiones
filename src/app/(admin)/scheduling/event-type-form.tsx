"use client";

import { useState } from "react";
import type { EventType } from "@/lib/types";

const DURATIONS = [15, 30, 45, 60, 90];

export function EventTypeForm({
  action,
  eventType,
}: {
  action: (formData: FormData) => void;
  eventType?: EventType;
}) {
  const [locationType, setLocationType] = useState(eventType?.location_type ?? "google_meet");
  const [color, setColor] = useState(eventType?.color ?? "#635EF2");

  return (
    <form action={action} className="max-w-xl space-y-5">
      <div>
        <label className="mb-1 block text-sm text-neutral-300">Name</label>
        <input
          name="name"
          required
          defaultValue={eventType?.name}
          placeholder="e.g. Client Brainstorming Session"
          className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-300">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={eventType?.description}
          className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-300">Duration</label>
        <select
          name="duration_minutes"
          defaultValue={eventType?.duration_minutes ?? 30}
          className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        >
          {DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-300">Location</label>
        <select
          name="location_type"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value as typeof locationType)}
          className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        >
          <option value="google_meet">Google Meet</option>
          <option value="in_person">In person</option>
          <option value="phone">Phone call</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-300">Color</label>
        <div className="flex items-center gap-2">
          {["#635EF2", "#595FD9", "#F25757", "#22c55e", "#f59e0b", "#06b6d4"].map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-7 w-7 rounded-full transition ${
                color === swatch ? "ring-2 ring-white ring-offset-2 ring-offset-base-900" : ""
              }`}
              aria-label={`Use color ${swatch}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-base-600 bg-base-850 p-0.5"
            aria-label="Custom color"
          />
        </div>
        <input type="hidden" name="color" value={color} />
      </div>

      {locationType !== "google_meet" && (
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Location details</label>
          <input
            name="location_details"
            defaultValue={eventType?.location_details}
            placeholder={locationType === "phone" ? "Who calls whom?" : "Address or details"}
            className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Buffer before (min)</label>
          <input
            type="number"
            min={0}
            name="buffer_before_minutes"
            defaultValue={eventType?.buffer_before_minutes ?? 0}
            className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Buffer after (min)</label>
          <input
            type="number"
            min={0}
            name="buffer_after_minutes"
            defaultValue={eventType?.buffer_after_minutes ?? 0}
            className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Minimum notice (min)</label>
          <input
            type="number"
            min={0}
            name="min_notice_minutes"
            defaultValue={eventType?.min_notice_minutes ?? 60}
            className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Booking horizon (days)</label>
          <input
            type="number"
            min={1}
            name="booking_horizon_days"
            defaultValue={eventType?.booking_horizon_days ?? 60}
            className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
      >
        {eventType ? "Save changes" : "Create event type"}
      </button>
    </form>
  );
}
