import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Maxyl Studios",
    template: "%s — Maxyl Studios",
  },
  description:
    "Ads and entertainment from Maxyl Studios.",
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
