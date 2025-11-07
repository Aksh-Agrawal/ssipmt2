import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Civic Voice Assistant',
  description: 'AI-Powered Civic Information Platform',
};

import { ThemeRegistry } from '@repo/ui';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/user/dashboard"
      afterSignUpUrl="/user/dashboard"
    >
      <html lang="en" className={inter.variable}>
        <body>
          <ThemeRegistry>{children}</ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
