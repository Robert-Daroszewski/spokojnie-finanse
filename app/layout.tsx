import type { Metadata } from "next";
import Ambient from "./ambient";

export const metadata: Metadata = {
  title: "Spokojnie — Twoje finanse",
  description: "Prywatna przestrzeń na wydatki, budżet i oszczędności. Mniej chaosu, więcej spokoju.",
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
    <html lang="pl">
      <head><link rel="stylesheet" href="/style.css" /><link rel="stylesheet" href="/refined.css" /><link rel="stylesheet" href="/motion.css" /><link rel="stylesheet" href="/atmosphere.css" /><link rel="stylesheet" href="/polish.css" /><link rel="stylesheet" href="/login.css" /><link rel="stylesheet" href="/investments.css" /><link rel="manifest" href="/manifest.webmanifest" /><link rel="apple-touch-icon" href="/icon-192.png" /><meta name="theme-color" content="#1d3932" /><meta name="apple-mobile-web-app-capable" content="yes" /></head>
      <body><Ambient />{children}</body>
    </html>
  );
}
