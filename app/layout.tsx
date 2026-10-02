import type { Metadata } from "next";
import "./globals.css";
import "./modern-theme.css";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Centro de Gestión Jurídica",
  description: "Clientes, expedientes, vencimientos, tareas y honorarios en un solo lugar.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <footer className="gian-global-footer">
          <img src="/gian-logo.jpeg" alt="GIAN Producciones Inteligentes" />
          <div>
            <strong><Scale /> Aplicación creada por GIAN Producciones Inteligentes</strong>
            <span>Teléfonos de contacto: <a href="tel:+543878506500">3878 506500</a> · <a href="tel:+543878586572">3878 586572</a></span>
            <p>Podemos digitalizar cualquier negocio o emprendimiento para que tengas un mayor control de todo.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
