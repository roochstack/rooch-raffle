import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { GlobalHeader } from '@/components/global-header';
import GlobalFooter from '@/components/global-footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Rooch Raffle',
  description: 'Rooch Raffle - create your own activities using Rooch',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}
      >
        <Providers>
          <GlobalHeader />
          {children}
          <GlobalFooter />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
