import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "RR Acessórios | Capas, Perfumes e Tecnologia",
  description: "Loja moderna de capas, acessórios para celular, perfumes e tecnologia.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
