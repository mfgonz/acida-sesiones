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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  // PNG, not the site's webp — some email clients (notably Outlook desktop) don't render webp.
  const logoUrl = `${appUrl}/logo-acida-ink-email.png`;

  const when = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: booking.inviteeTimezone,
  }).format(booking.startTime);

  // Brand tokens (September 2026 manual): cream, ink, terracotta, bone.
  const CREAM = "#F7F7EF";
  const INK = "#2B2B27";
  const TERRACOTTA = "#DD7130";
  const BONE = "#EBE9D8";
  const MUTED = "#6B6A5F";

  const joinSection = booking.meetLink
    ? `
      <tr>
        <td style="padding: 28px 40px 4px;">
          <p style="margin: 0 0 12px; font: 600 11px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">Google Meet</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color: ${TERRACOTTA};">
                <a href="${escapeHtml(booking.meetLink)}" style="display: inline-block; padding: 13px 24px; font: 600 13px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.04em; color: ${CREAM}; text-decoration: none;">Unirse a la sesión</a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0; font: 400 13px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${MUTED}; word-break: break-all;">
            O copia este link: <a href="${escapeHtml(booking.meetLink)}" style="color: ${TERRACOTTA};">${escapeHtml(booking.meetLink)}</a>
          </p>
        </td>
      </tr>`
    : booking.locationDetails
      ? `
      <tr>
        <td style="padding: 28px 40px 4px;">
          <p style="margin: 0 0 6px; font: 600 11px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">Lugar</p>
          <p style="margin: 0; font: 400 15px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${INK};">${escapeHtml(booking.locationDetails)}</p>
        </td>
      </tr>`
      : "";

  const html = `
  <div style="background-color: ${CREAM}; padding: 40px 16px; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid ${BONE};">
      <tr>
        <td style="padding: 32px 40px 24px;">
          <img src="${logoUrl}" alt="ÁCIDA" height="26" style="display: block; height: 26px; width: auto;" />
        </td>
      </tr>
      <tr><td style="border-top: 1px solid ${BONE};"></td></tr>
      <tr>
        <td style="padding: 28px 40px 0;">
          <h1 style="margin: 0 0 6px; font: 400 24px/1.2 'Helvetica Neue', Arial, sans-serif; color: ${INK};">Tu sesión está confirmada</h1>
          <p style="margin: 0; font: 400 14px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${MUTED};">Nos vemos pronto.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 40px 0;">
          <p style="margin: 0 0 14px; font: 400 14px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${INK};">Aquí están los detalles de la llamada:</p>
          <p style="margin: 0 0 6px; font: 600 11px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">Sesión</p>
          <p style="margin: 0 0 18px; font: 400 15px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${INK};">${escapeHtml(booking.eventTypeName)}</p>
          <p style="margin: 0 0 6px; font: 600 11px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">Fecha y hora</p>
          <p style="margin: 0; font: 400 15px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${INK};">${escapeHtml(when)} (${escapeHtml(booking.inviteeTimezone)})</p>
        </td>
      </tr>
      ${joinSection}
      <tr><td style="padding-top: 28px; border-top: 1px solid ${BONE};"></td></tr>
      <tr>
        <td style="padding: 20px 40px 32px;">
          <p style="margin: 0 0 8px; font: 400 13px/1.5 'Helvetica Neue', Arial, sans-serif; color: ${MUTED};">
            <a href="${escapeHtml(booking.cancelUrl)}" style="color: ${MUTED};">¿Necesitas cancelar o reprogramar?</a>
          </p>
          <p style="margin: 0; font: 600 10px/1 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">
            ÁCIDA // Casa productora y creadora de proyectos con propósito
          </p>
        </td>
      </tr>
    </table>
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
