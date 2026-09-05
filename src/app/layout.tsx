import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "../data/site";

export const metadata: Metadata = {
  // Ger absoluta URL:er i og:- och canonical-taggar. Utan den blir de relativa,
  // vilket delningar och sökmotorer inte kan följa.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Skapa hyresavtal – rätt lag för din uthyrning",
  description:
    "Skapa ett hyresavtal för bostad som utgår från rätt lag: privatuthyrningslagen eller hyreslagen. Guidat flöde, korrekta uppsägningstider och gratis PDF.",
  keywords: [
    "hyresavtal",
    "hyreskontrakt",
    "hyresavtal mall",
    "andrahandsuthyrning avtal",
    "privatuthyrningslagen",
  ],
  openGraph: {
    title: "Skapa hyresavtal – rätt lag för din uthyrning",
    description:
      "Guidat flöde som avgör om privatuthyrningslagen eller hyreslagen gäller, och skapar avtalet därefter. Gratis PDF.",
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
