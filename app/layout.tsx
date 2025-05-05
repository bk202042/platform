import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster component for notifications

export const metadata: Metadata = {
  title: "Vietnam Property Platform | Find Your Perfect Home",
  description:
    "Discover properties tailored for Korean expatriates in Vietnam's most popular locations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="antialiased bg-background text-foreground" // Use theme variables
      >
        <div className="relative flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster />
          <Footer /> {/* Add the Footer component */}
        </div>
      </body>
    </html>
  );
}
