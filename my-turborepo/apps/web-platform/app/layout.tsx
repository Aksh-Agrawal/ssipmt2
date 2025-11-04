import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Voice Assistant",
  description: "AI-Powered Civic Information Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
