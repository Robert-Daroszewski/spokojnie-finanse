import type { Metadata } from "next";

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
      <head><link rel="stylesheet" href="/style.css" /><link rel="stylesheet" href="/refined.css" /><link rel="stylesheet" href="/motion.css" /><link rel="manifest" href="/manifest.webmanifest" /><meta name="theme-color" content="#1d3932" /><meta name="apple-mobile-web-app-capable" content="yes" /></head>
      <body>{children}</body>
    </html>
  );
}
