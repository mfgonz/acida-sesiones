import { createEventType } from "../actions";
import { EventTypeForm } from "../event-type-form";

export default function NewEventTypePage() {
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-ink">New event type</h2>
      <EventTypeForm action={createEventType} />
    </div>
  );
}
