import { AUTHOR, SITE_CONFIG } from "@/config";
import { khInterference, ppFraktionMono } from "@/lib/fonts";
import "@/styles/globals.scss";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: `%s — ${AUTHOR.name}`,
  },
  description: SITE_CONFIG.description,
  authors: [{ name: AUTHOR.name }],
  creator: AUTHOR.name,
  metadataBase: new URL(SITE_CONFIG.url),
  keywords: [
    "Full Stack Engineer",
    "AI Developer",
    "Web Development",
    "Indonesia",
    "TypeScript",
    "React",
    "Next.js",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    creator: `@${AUTHOR.name}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c1c1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${khInterference.variable} ${ppFraktionMono.variable}`}
      /**
       * suppressHydrationWarning: the theme hook sets data-theme on the
       * html element client-side, which causes a benign hydration mismatch.
       * This attribute suppresses that React warning without disabling the
       * full hydration check for child elements.
       */
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}


