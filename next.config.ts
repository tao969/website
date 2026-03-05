import type { NextConfig } from "next";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Security headers
// Applied to every route via the `headers()` async function below.
// ─────────────────────────────────────────────────────────────────────────────

const SECURITY_HEADERS = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",           value: "nosniff" },
  // Block framing entirely to prevent clickjacking
  { key: "X-Frame-Options",                  value: "DENY" },
  // Control referrer information sent to third parties
  { key: "Referrer-Policy",                  value: "strict-origin-when-cross-origin" },
  // Restrict browser features not needed by this site
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enforce HTTPS for 2 years and include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent DNS prefetching to reduce privacy leakage
  { key: "X-DNS-Prefetch-Control",           value: "off" },
  // Block IE file download prompt bypass
  { key: "X-Download-Options",              value: "noopen" },
  // Deny cross-domain policy files (Flash/PDF)
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  // ── SCSS modules ────────────────────────────────────────────────────────────
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        // Allow fonts to be served cross-origin (required for preload hints)
        source: "/fonts/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Long-lived cache for Next.js static assets
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Immutable cache for public icons
        source: "/icons/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ── Core settings ───────────────────────────────────────────────────────────
  reactStrictMode:  true,
  poweredByHeader:  false,

  // ── Compiler optimisations ──────────────────────────────────────────────────
  compiler: {
    // Strip console.* calls from production bundles
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ── Image optimisation ──────────────────────────────────────────────────────
  images: {
    // Restrict to formats supported by all modern browsers
    formats: ["image/avif", "image/webp"],
    // All images are local; no remote patterns needed
    remotePatterns: [],
    // Disable the blur placeholder for SVG/PNG icons (they're tiny)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Experimental ────────────────────────────────────────────────────────────
  experimental: {
    // Optimise client-side navigation by pre-fetching on hover
    // (default in Next.js 14+, explicit here for clarity)
    optimisticClientCache: true,
  },
};

export default nextConfig;

