import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papa Muay Thai | Cocina tailandesa",
  description: "Menú de cocina tailandesa. Consultas y pedidos directamente por WhatsApp en Paraguay.",
  openGraph: {
    title: "Papa Muay Thai",
    description: "Cocina tailandesa · Pedidos por WhatsApp",
    locale: "es_PY",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
