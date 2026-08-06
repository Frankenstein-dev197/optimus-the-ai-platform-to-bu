import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimus Dev - Environnements de Développement Cloud & IA unifiés",
  description: "Portail officiel de la plateforme Optimus Dev. Gérez vos espaces de travail, clés API, intégrations Git et services d'intelligence artificielle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen bg-neutral-950 text-neutral-50">
        {children}
      </body>
    </html>
  );
}
