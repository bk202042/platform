import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "A minimal, clean starting point for your Next.js project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
