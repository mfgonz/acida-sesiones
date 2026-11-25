import { Resend } from "resend";

interface BookingNotification {
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteePhone: string;
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

interface BookingReschedule {
  eventTypeName: string;
  inviteeEmail: string;
  inviteeTimezone: string;
  startTime: Date;
  endTime: Date;
  meetLink: string | null;
  locationDetails: string | null;
  cancelUrl: string;
  reason?: string | null;
}

// Brand tokens (September 2026 manual): light palette for emails.
const CREAM = "#F7F7EF";
const INK = "#2B2B27";
const TERRACOTTA = "#DD7130";
const BONE = "#EBE9D8";
const MUSTARD = "#F5EFA7";
const BLUSH = "#EAC5E6";
const MUTED = "#6B6A5F";
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * A background that survives dark-mode email clients: the gradient image keeps
 * Gmail's apps from inverting it, and the color is the fallback everywhere else.
 */
function bg(color: string) {
  return `background-color: ${color}; background-image: linear-gradient(${color}, ${color});`;
}

const LABEL_STYLE = `margin: 0 0 6px; font: 600 11px/1 ${FONT}; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};`;
const VALUE_STYLE = `margin: 0; font: 400 15px/1.5 ${FONT}; color: ${INK};`;

/** Wraps an email body in a full document that asks clients to keep it light. */
function wrapEmailDocument(body: string) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light" />
<style>
  :root { color-scheme: light only; supported-color-schemes: light; }
  body { margin: 0; padding: 0; ${bg(CREAM)} }
  [data-ogsc] .ink, [data-ogsb] .ink { color: ${INK} !important; }
</style>
</head>
<body style="margin: 0; padding: 0; ${bg(CREAM)}">
${body}
</body>
</html>`;
}

/** The shared card used by every email the invitee sees (confirmation, reschedule, cancellation). */
export function buildSessionEmailHtml(params: {
  heading: string;
  subtext: string;
  eventTypeName: string;
  when: string;
  inviteeTimezone: string;
  meetLink: string | null;
  locationDetails: string | null;
  footerLink: { href: string; label: string };
  reason?: { label: string; text: string } | null;
  showDetailsIntro?: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  // PNG with the mustard background baked in: dark-mode clients don't invert
  // images, so the ink logo never ends up dark-on-dark.
  const logoUrl = `${appUrl}/logo-acida-email-mustard.png`;

  const reasonSection = params.reason?.text
    ? `
      <tr>
        <td style="padding: 22px 40px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="${bg(BLUSH)} padding: 16px 18px; border-left: 3px solid ${TERRACOTTA};">
                <p style="${LABEL_STYLE} color: ${INK};">${escapeHtml(params.reason.label)}</p>
                <p class="ink" style="${VALUE_STYLE} white-space: pre-line;">${escapeHtml(params.reason.text)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const joinSection = params.meetLink
    ? `
      <tr>
        <td style="padding: 26px 40px 0;">
          <p style="${LABEL_STYLE} margin-bottom: 12px;">Google Meet</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="${bg(TERRACOTTA)} border-radius: 6px;">
                <a href="${escapeHtml(params.meetLink)}" style="display: inline-block; padding: 13px 24px; font: 600 13px/1 ${FONT}; letter-spacing: 0.04em; color: ${CREAM}; text-decoration: none;">Unirse a la sesión</a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0; font: 400 13px/1.5 ${FONT}; color: ${MUTED}; word-break: break-all;">
            O copia este link: <a href="${escapeHtml(params.meetLink)}" style="color: ${TERRACOTTA};">${escapeHtml(params.meetLink)}</a>
          </p>
        </td>
      </tr>`
    : params.locationDetails
      ? `
      <tr>
        <td style="padding: 26px 40px 0;">
          <p style="${LABEL_STYLE}">Lugar</p>
          <p class="ink" style="${VALUE_STYLE}">${escapeHtml(params.locationDetails)}</p>
        </td>
      </tr>`
      : "";

  const body = `
  <div style="${bg(CREAM)} padding: 40px 16px; font-family: ${FONT};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; ${bg(CREAM)} border: 1px solid ${BONE};">
      <tr>
        <td style="${bg(MUSTARD)} padding: 28px 40px;">
          <img src="${logoUrl}" alt="ÁCIDA" height="30" style="display: block; height: 30px; width: auto; border: 0;" />
        </td>
      </tr>
      <tr>
        <td style="padding: 32px 40px 0;">
          <h1 class="ink" style="margin: 0 0 6px; font: 400 26px/1.2 ${FONT}; color: ${INK};">${escapeHtml(params.heading)}</h1>
          <p style="margin: 0; font: 400 15px/1.5 ${FONT}; color: ${MUTED};">${escapeHtml(params.subtext)}</p>
        </td>
      </tr>
      ${reasonSection}
      <tr>
        <td style="padding: 22px 40px 0;">
          ${params.showDetailsIntro === false ? "" : `<p class="ink" style="margin: 0 0 12px; font: 400 14px/1.5 ${FONT}; color: ${INK};">Aquí están los detalles de la llamada:</p>`}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="${bg(BONE)} padding: 18px 20px;">
                <p style="${LABEL_STYLE}">Sesión</p>
                <p class="ink" style="${VALUE_STYLE} margin-bottom: 16px;">${escapeHtml(params.eventTypeName)}</p>
                <p style="${LABEL_STYLE}">Fecha y hora</p>
                <p class="ink" style="${VALUE_STYLE}">${escapeHtml(params.when)}<br /><span style="color: ${MUTED}; font-size: 13px;">${escapeHtml(params.inviteeTimezone)}</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${joinSection}
      <tr>
        <td style="padding: 32px 40px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="border-top: 1px solid ${BONE}; padding-top: 20px;">
              <p style="margin: 0 0 10px; font: 400 13px/1.5 ${FONT};">
                <a href="${escapeHtml(params.footerLink.href)}" style="color: ${TERRACOTTA};">${escapeHtml(params.footerLink.label)}</a>
              </p>
              <p style="margin: 0; font: 600 10px/1.4 ${FONT}; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED};">
                ÁCIDA // Casa productora y creadora de proyectos con propósito
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return wrapEmailDocument(body);
}

/** Brand-light layout for the internal emails sent to the admin. */
function buildAdminEmailHtml(title: string, lead: string, rows: [string, string][]) {
  const body = `
  <div style="${bg(CREAM)} padding: 32px 16px; font-family: ${FONT};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto; ${bg(CREAM)} border: 1px solid ${BONE};">
      <tr>
        <td style="${bg(MUSTARD)} padding: 18px 28px;">
          <p style="margin: 0; font: 600 11px/1 ${FONT}; letter-spacing: 0.08em; text-transform: uppercase; color: ${INK};">ÁCIDA · Sesiones</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px 28px 8px;">
          <h1 class="ink" style="margin: 0 0 6px; font: 400 22px/1.2 ${FONT}; color: ${INK};">${escapeHtml(title)}</h1>
          <p style="margin: 0; font: 400 14px/1.5 ${FONT}; color: ${MUTED};">${escapeHtml(lead)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 28px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${rows
              .map(
                ([label, value]) => `
            <tr>
              <td style="padding: 10px 12px 10px 0; border-top: 1px solid ${BONE}; font: 600 11px/1.4 ${FONT}; letter-spacing: 0.06em; text-transform: uppercase; color: ${MUTED}; vertical-align: top; white-space: nowrap;">${escapeHtml(label)}</td>
              <td class="ink" style="padding: 10px 0; border-top: 1px solid ${BONE}; font: 400 14px/1.5 ${FONT}; color: ${INK}; white-space: pre-line; word-break: break-word;">${escapeHtml(value)}</td>
            </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  </div>`;
  return wrapEmailDocument(body);
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
    ["Correo", booking.inviteeEmail],
    ["WhatsApp", booking.inviteePhone],
    ["Fecha y hora", `${when} (${booking.inviteeTimezone})`],
    ...(booking.projectName ? ([["Proyecto/negocio", booking.projectName]] as [string, string][]) : []),
    ...(booking.projectSummary ? ([["Qué buscan trabajar", booking.projectSummary]] as [string, string][]) : []),
    ["Notas", booking.inviteeNotes || "—"],
    ["Google Meet", booking.meetLink ?? "—"],
  ];

  const html = buildAdminEmailHtml("Nueva reserva", "Alguien agendó una sesión en ACIDA.", rows);

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

  const html = buildSessionEmailHtml({
    heading: "Tu sesión está confirmada",
    subtext: "Nos vemos pronto.",
    eventTypeName: booking.eventTypeName,
    when,
    inviteeTimezone: booking.inviteeTimezone,
    meetLink: booking.meetLink,
    locationDetails: booking.locationDetails,
    footerLink: { href: booking.cancelUrl, label: "¿Necesitas cancelar o reprogramar?" },
  });

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

/** Emails the invitee when the admin reschedules their session to a new time. */
export async function sendBookingReschedule(booking: BookingReschedule) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Booking reschedule email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL not set");
    return;
  }

  const when = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: booking.inviteeTimezone,
  }).format(booking.startTime);

  const html = buildSessionEmailHtml({
    heading: "Tu sesión fue reprogramada",
    subtext: "Aquí está tu nuevo horario.",
    reason: booking.reason ? { label: "Motivo del cambio", text: booking.reason } : null,
    eventTypeName: booking.eventTypeName,
    when,
    inviteeTimezone: booking.inviteeTimezone,
    meetLink: booking.meetLink,
    locationDetails: booking.locationDetails,
    footerLink: { href: booking.cancelUrl, label: "¿Necesitas cancelar o reprogramar?" },
  });

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: booking.inviteeEmail,
      subject: `Reprogramada: ${booking.eventTypeName}`,
      html,
    });
    if (error) console.error("Failed to send booking reschedule email", error);
  } catch (err) {
    console.error("Failed to send booking reschedule email", err);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Emails the invitee when their session is canceled (by them or by the admin). */
export async function sendBookingCancellation(booking: {
  eventTypeName: string;
  inviteeEmail: string;
  inviteeTimezone: string;
  startTime: Date;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Booking cancellation email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL not set");
    return;
  }

  const when = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: booking.inviteeTimezone,
  }).format(booking.startTime);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const html = buildSessionEmailHtml({
    heading: "Tu sesión fue cancelada",
    subtext: "Esta llamada ya no está en el calendario.",
    eventTypeName: booking.eventTypeName,
    when,
    inviteeTimezone: booking.inviteeTimezone,
    meetLink: null,
    locationDetails: null,
    footerLink: { href: appUrl, label: "Agendar una nueva sesión" },
  });

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: booking.inviteeEmail,
      subject: `Cancelada: ${booking.eventTypeName}`,
      html,
    });
    if (error) console.error("Failed to send booking cancellation email", error);
  } catch (err) {
    console.error("Failed to send booking cancellation email", err);
  }
}

/** Tells the admin a booking was canceled or rescheduled — new bookings use sendBookingNotification. */
export async function sendAdminBookingUpdate(update: {
  action: "canceled" | "rescheduled";
  actor: "admin" | "client";
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteePhone: string | null;
  timezone: string;
  startTime: Date;
  previousStartTime?: Date;
  reason?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !to) {
    console.error("Admin booking update skipped: RESEND_API_KEY, RESEND_FROM_EMAIL, or ADMIN_EMAIL not set");
    return;
  }

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short", timeZone: update.timezone }).format(d);

  const title = update.action === "canceled" ? "Reserva cancelada" : "Reserva reprogramada";
  const byWhom = update.actor === "client" ? "El cliente" : "Tú";
  const lead =
    update.action === "canceled"
      ? `${byWhom} canceló esta sesión. Ya se eliminó del calendario.`
      : `${byWhom} movió esta sesión a un nuevo horario.`;

  const rows: [string, string][] = [
    ["Tipo de sesión", update.eventTypeName],
    ["Nombre", update.inviteeName],
    ["Correo", update.inviteeEmail],
    ["WhatsApp", update.inviteePhone || "—"],
    ...(update.previousStartTime ? ([["Horario anterior", fmt(update.previousStartTime)]] as [string, string][]) : []),
    [update.action === "canceled" ? "Horario" : "Nuevo horario", `${fmt(update.startTime)} (${update.timezone})`],
    ...(update.reason ? ([["Motivo", update.reason]] as [string, string][]) : []),
  ];

  const html = buildAdminEmailHtml(title, lead, rows);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `${title}: ${update.eventTypeName} con ${update.inviteeName}`,
      html,
    });
    if (error) console.error("Failed to send admin booking update email", error);
  } catch (err) {
    console.error("Failed to send admin booking update email", err);
  }
}
