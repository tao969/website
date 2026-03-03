import localFont from 'next/font/local';

// KH Interference - Modern, sophisticated sans-serif for headings and UI
// Professional typography system designed for Awwards-winning websites
export const khInterference = localFont({
  src: [
    {
      path: '../../public/fonts/kh-interference/KHInterference-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/kh-interference/KHInterference-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-kh',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// PP FraktionMono - Clean monospace for body text and technical content
// Professional monospace font for modern web typography
export const ppFraktionMono = localFont({
  src: [
    {
      path: '../../public/fonts/pp-fraktion/PPFraktionMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-pp',
  display: 'swap',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
});

// Legacy exports for backward compatibility
export const inter = khInterference;
export const poppins = khInterference;
export const mono = ppFraktionMono;
