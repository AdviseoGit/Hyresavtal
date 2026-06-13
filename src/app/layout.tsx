import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skapa Hyresavtal – juridiskt korrekt avtal på minuter",
  description:
    "Skapa ett juridiskt korrekt hyresavtal för bostad enligt 12 kap. Jordabalken (Hyreslagen). Guidat flöde, gratis PDF, anpassat efter tillsvidare eller bestämd tid.",
  keywords: [
    "hyresavtal",
    "hyreskontrakt",
    "hyresavtal mall",
    "andrahandsuthyrning avtal",
    "hyresavtal bostad",
  ],
  openGraph: {
    title: "Skapa Hyresavtal – juridiskt korrekt på minuter",
    description:
      "Guidat flöde som skapar ett korrekt hyresavtal enligt Hyreslagen. Gratis PDF.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
