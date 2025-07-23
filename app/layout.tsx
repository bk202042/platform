import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster component for notifications
import { Noto_Sans_KR } from "next/font/google";
import StagewiseToolbarLoader from "@/components/stagewise/StagewiseToolbarLoader";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getInitialUser } from "@/lib/auth/server";
import { ToastProvider } from "@/components/community/ToastProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const notoSansKR = Noto_Sans_KR({
  // @ts-expect-error // Allow 'korean' subset, expect a type error here which we are overriding.
  subsets: ["korean"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-kr",
  preload: false, // Good practice for CJK fonts
});

export const metadata: Metadata = {
  title: "하노이 호치민 다낭 부동산 플랫폼 | 완벽한 집 찾기",
  description:
    "하노이 호치민 다낭 부동산 플랫폼은 베트남의 한국인 거주자를 위한 맞춤형 부동산을 찾아보세요",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get initial user data on server side to prevent hydration mismatch
  const initialUser = await getInitialUser();

  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground" // Use theme variables. Font is now on HTML tag.
      >
        <AuthProvider initialUser={initialUser}>
          <ToastProvider>
            <div className="relative flex min-h-screen flex-col bg-background">
              <StagewiseToolbarLoader />
              <Header />
              <main className="flex-1">{children}</main>
              <Toaster />
              <Footer /> {/* Add the Footer component */}
              <SpeedInsights />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
