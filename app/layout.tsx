import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vietnam Property Platform | Find Your Perfect Home",
  description: "Discover properties tailored for Korean expatriates in Vietnam's most popular locations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
