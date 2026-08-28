import { Resend } from "resend";

interface BookingNotification {
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string;
  inviteeTimezone: string;
  startTime: Date;
  endTime: Date;
  meetLink: string | null;
}

/**
 * Emails the admin whenever a booking is made. Failures are logged, never
 * thrown — a notification hiccup must not fail the booking itself (the
 * booking row and Google Calendar event are already committed by then).
 */
export async function sendBookingNotification(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !to) {
    console.error("Booking notification skipped: RESEND_API_KEY, RESEND_FROM_EMAIL, or ADMIN_EMAIL not set");
    return;
  }

  const when = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: booking.inviteeTimezone,
  }).format(booking.startTime);

  const rows: [string, string][] = [
    ["Tipo de sesión", booking.eventTypeName],
    ["Nombre", booking.inviteeName],
    ["Email", booking.inviteeEmail],
    ["Fecha y hora", `${when} (${booking.inviteeTimezone})`],
    ["Notas", booking.inviteeNotes || "—"],
    ["Google Meet", booking.meetLink ?? "—"],
  ];

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="margin-bottom: 4px;">Nueva reserva</h2>
      <p style="color: #666; margin-top: 0;">Alguien agendó una sesión en ACIDA.</p>
      <table style="border-collapse: collapse; width: 100%;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top; white-space: nowrap;">${label}</td>
            <td style="padding: 6px 0;">${escapeHtml(value)}</td>
          </tr>`
          )
          .join("")}
      </table>
    </div>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Nueva reserva: ${booking.eventTypeName} con ${booking.inviteeName}`,
      html,
    });
    if (error) console.error("Failed to send booking notification email", error);
  } catch (err) {
    console.error("Failed to send booking notification email", err);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
