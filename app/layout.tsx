import type { Metadata } from "next";
import { Almendra, MedievalSharp } from "next/font/google";
import "./globals.css";

const almendra = Almendra({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-almendra",
});

const medievalSharp = MedievalSharp({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-medieval",
});

export const metadata: Metadata = {
  title: "Tablón de Vesperia",
  description: "Tablón medieval para el Consejo y los aventureros de Vesperia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${almendra.variable} ${medievalSharp.variable}`}>
      <body>{children}</body>
    </html>
  );
}
