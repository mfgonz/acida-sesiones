import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const apfelGrotezk = localFont({
  src: [
    { path: "../fonts/apfelgrotezk/ApfelGrotezk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/apfelgrotezk/ApfelGrotezk-Mittel.woff2", weight: "500", style: "normal" },
    { path: "../fonts/apfelgrotezk/ApfelGrotezk-Satt.woff2", weight: "700", style: "normal" },
    { path: "../fonts/apfelgrotezk/ApfelGrotezk-Fett.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-display",
});

const ibmPlexMono = localFont({
  src: [
    { path: "../fonts/ibmplexmono/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibmplexmono/IBMPlexMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ACIDA Sesiones",
  description: "Schedule sessions with ACIDA",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon.ico" },
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${apfelGrotezk.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
