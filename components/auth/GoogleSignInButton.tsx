"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface GoogleSignInButtonProps {
  children: React.ReactNode;
  returnUrl?: string;
}

export default function GoogleSignInButton({
  children,
  returnUrl = "/",
}: GoogleSignInButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async () => {
    if (!isClient) return;
    
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    if (returnUrl !== "/") {
      redirectUrl.searchParams.set("returnUrl", returnUrl);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });
  };

  // Show loading state during SSR hydration
  if (!isClient) {
    return (
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        disabled
      >
        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
        <span>{children}</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
        alt="Google logo"
        width={20}
        height={20}
      />
      <span>{children}</span>
    </Button>
  );
}
