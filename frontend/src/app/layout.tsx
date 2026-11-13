import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';
import './globals.css';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { ThemeProvider, themeScript } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

export const metadata: Metadata = {
  title: { default: 'Cashflow', template: '%s · Cashflow' },
  description: 'Track every expense, get a daily spending allowance, and see where your money goes.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#050605' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
