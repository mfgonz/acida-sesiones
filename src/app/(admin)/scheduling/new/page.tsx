import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { createEventType } from "../actions";
import { EventTypeForm } from "../event-type-form";

export default function NewEventTypePage() {
  return (
    <>
      <AdminPageHeader n="02" title="Nuevo tipo de sesión">
        <Link href="/scheduling" className="btn">
          Volver
        </Link>
      </AdminPageHeader>
      <EventTypeForm action={createEventType} />
    </>
  );
}
