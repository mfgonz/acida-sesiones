import { createEventType } from "../actions";
import { EventTypeForm } from "../event-type-form";

export default function NewEventTypePage() {
  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-ink">New event type</h2>
      <EventTypeForm action={createEventType} />
    </div>
  );
}
