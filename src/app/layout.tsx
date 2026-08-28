import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skapa hyresavtal – rätt lag för din uthyrning",
  description:
    "Skapa ett hyresavtal för bostad som utgår från rätt lag: lagen om uthyrning av egen bostad eller hyreslagen. Guidat flöde, korrekta uppsägningstider och gratis PDF.",
  keywords: [
    "hyresavtal",
    "hyreskontrakt",
    "hyresavtal mall",
    "andrahandsuthyrning avtal",
    "uthyrning av egen bostad",
  ],
  openGraph: {
    title: "Skapa hyresavtal – rätt lag för din uthyrning",
    description:
      "Guidat flöde som avgör om lagen om uthyrning av egen bostad eller hyreslagen gäller, och skapar avtalet därefter. Gratis PDF.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv-SE">
      <body>{children}</body>
    </html>
  );
}
