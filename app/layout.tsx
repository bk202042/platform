import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster component for notifications
import { Noto_Sans_KR } from "next/font/google";
import StagewiseToolbarLoader from "@/components/stagewise/StagewiseToolbarLoader";

const notoSansKR = Noto_Sans_KR({
  // @ts-expect-error // Allow 'korean' subset, expect a type error here which we are overriding.
  subsets: ["korean"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-kr",
  preload: false, // Good practice for CJK fonts
});

export const metadata: Metadata = {
  title: "베트남 부동산 플랫폼 | 완벽한 집 찾기",
  description:
    "베트남 인기 지역의 한국인 거주자를 위한 맞춤형 부동산을 찾아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground" // Use theme variables. Font is now on HTML tag.
      >
        <div className="relative flex min-h-screen flex-col bg-background">
          <StagewiseToolbarLoader />
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster />
          <Footer /> {/* Add the Footer component */}
        </div>
      </body>
    </html>
  );
}
