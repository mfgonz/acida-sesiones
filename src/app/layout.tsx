import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-display",
});

const ppNeue = localFont({
  src: [
    { path: "../fonts/ppneuemontreal/ppneuemontreal-book.otf", weight: "400", style: "normal" },
    { path: "../fonts/ppneuemontreal/ppneuemontreal-italic.otf", weight: "400", style: "italic" },
    { path: "../fonts/ppneuemontreal/ppneuemontreal-medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/ppneuemontreal/ppneuemontreal-semibolditalic.otf", weight: "600", style: "italic" },
    { path: "../fonts/ppneuemontreal/ppneuemontreal-bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ACIDA Sesiones",
  description: "Schedule sessions with ACIDA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${ppNeue.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
