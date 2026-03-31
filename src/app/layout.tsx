import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const syne   = Syne({ subsets:["latin"], variable:"--font-display", weight:["400","500","600","700","800"] });
const dmSans = DM_Sans({ subsets:["latin"], variable:"--font-body" });

export const metadata: Metadata = {
  title: "Copy Systems E.I.R.L. | Impresoras y Equipos de Oficina",
  description: "Tienda de impresoras, fotocopiadoras, tóners e insumos en Huancayo, Junín. Servicio técnico especializado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable}`}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
