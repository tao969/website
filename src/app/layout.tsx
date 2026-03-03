import DevBadge from "@/components/ui/dev-badge";
import { AUTHOR, SITE_CONFIG } from "@/constants/site";
import { khInterference, ppFraktionMono } from "@/lib/fonts";
import "@/styles/globals.scss";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  authors: [{ name: AUTHOR.name }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${khInterference.variable} ${ppFraktionMono.variable}`}>
      <body>
        {children}
        <DevBadge />
      </body>
    </html>
  );
}
