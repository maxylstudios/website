import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maxyl Studios",
    template: "%s — Maxyl Studios",
  },
  description: "Ads and entertainment from Maxyl Studios.",
  openGraph: {
    type: "website",
    title: "Maxyl Studios",
    description: "Ads and entertainment from Maxyl Studios.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Maxyl Studios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${comfortaa.variable} h-full antialiased`}>
      <body className="min-h-full bg-black text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
