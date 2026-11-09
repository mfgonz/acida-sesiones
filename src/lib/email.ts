import { Resend } from "resend";

interface BookingNotification {
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string;
  inviteeTimezone: string;
  projectName: string | null;
  projectSummary: string | null;
  startTime: Date;
  endTime: Date;
  meetLink: string | null;
}

interface BookingConfirmation {
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeTimezone: string;
  startTime: Date;
  endTime: Date;
  meetLink: string | null;
  locationDetails: string | null;
  cancelUrl: string;
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
    ...(booking.projectName ? ([["Proyecto/negocio", booking.projectName]] as [string, string][]) : []),
    ...(booking.projectSummary ? ([["Qué buscan trabajar", booking.projectSummary]] as [string, string][]) : []),
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

/**
 * Emails the invitee their own confirmation — every event type, Google Meet
 * or not. Unlike Google Calendar's own auto-invite (which buries the Meet
 * link behind a "Join" button whose markup varies by email client), this
 * always prints the full join URL as plain, selectable, copy-pasteable
 * text, so it reaches the client even if the Google invite email is
 * filtered, delayed, or rendered oddly.
 */
export async function sendBookingConfirmation(booking: BookingConfirmation) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Booking confirmation skipped: RESEND_API_KEY or RESEND_FROM_EMAIL not set");
    return;
  }

  const when = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: booking.inviteeTimezone,
  }).format(booking.startTime);

  const joinSection = booking.meetLink
    ? `
      <tr>
        <td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top; white-space: nowrap;">Google Meet</td>
        <td style="padding: 6px 0; word-break: break-all;">
          <a href="${escapeHtml(booking.meetLink)}" style="color: #DD7130;">${escapeHtml(booking.meetLink)}</a>
        </td>
      </tr>`
    : booking.locationDetails
      ? `
      <tr>
        <td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top; white-space: nowrap;">Lugar</td>
        <td style="padding: 6px 0;">${escapeHtml(booking.locationDetails)}</td>
      </tr>`
      : "";

  const rows: [string, string][] = [
    ["Sesión", booking.eventTypeName],
    ["Fecha y hora", `${when} (${booking.inviteeTimezone})`],
  ];

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="margin-bottom: 4px;">Tu sesión está confirmada</h2>
      <p style="color: #666; margin-top: 0;">Te esperamos — aquí están los detalles.</p>
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
        ${joinSection}
      </table>
      <p style="margin-top: 20px;">
        <a href="${escapeHtml(booking.cancelUrl)}" style="color: #666; font-size: 13px;">¿Necesitas cancelar?</a>
      </p>
    </div>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: booking.inviteeEmail,
      subject: `Confirmación: ${booking.eventTypeName}`,
      html,
    });
    if (error) console.error("Failed to send booking confirmation email", error);
  } catch (err) {
    console.error("Failed to send booking confirmation email", err);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
