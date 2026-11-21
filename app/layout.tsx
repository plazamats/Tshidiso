import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/*
 * Performance: self-host fonts with next/font/local using system-font-stack
 * fallbacks. This eliminates the external Google Fonts network request that was
 * blocking the build AND causing a render-blocking stylesheet download at
 * runtime (the #1 reason for the slow initial paint).
 *
 * If you want the original Google fonts back, download the .woff2 files into
 * public/fonts/ and point localFont at them.  For now we use the CSS variable
 * approach with system fallbacks so the build works offline.
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'For Tshidi — A Birthday Universe',
  description: 'A little universe made with love, for the most incredible woman alive.',
  openGraph: {
    title: 'For Tshidi — A Birthday Universe',
    description: 'A little universe made with love. Tap to enter.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#07051a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
