import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bestam",
  description: "Personal budget & financial stability",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
