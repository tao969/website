import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable SCSS modules
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },

  // Basic Security Headers (simplified for Vercel)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Basic configurations
  reactStrictMode: true,
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
