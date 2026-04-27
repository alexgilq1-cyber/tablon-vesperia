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
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#1d120d",
          backgroundImage: `
            radial-gradient(circle at top, rgba(255,210,120,0.10), transparent 35%),
            repeating-linear-gradient(
              90deg,
              rgba(92,58,36,0.35) 0px,
              rgba(92,58,36,0.35) 24px,
              rgba(55,31,20,0.42) 24px,
              rgba(55,31,20,0.42) 48px
            ),
            linear-gradient(180deg, #5d3b25 0%, #2a1812 100%)
          `,
          color: "#f5e7c8",
          fontFamily: "Georgia, serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
