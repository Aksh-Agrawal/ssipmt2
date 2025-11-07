import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
  preload: true,
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Admin Dashboard - Civic Voice Assistant',
  description: 'Administrative dashboard for managing civic reports and content',
};

import { ThemeRegistry } from '@repo/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      afterSignInUrl="/admin/dashboard"
      afterSignUpUrl="/admin/dashboard"
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          <ThemeRegistry>{children}</ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
