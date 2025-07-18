"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  children: React.ReactNode;
  returnUrl?: string;
}

export default function GoogleSignInButton({
  children,
  returnUrl = "/",
}: GoogleSignInButtonProps) {
  const supabase = createClient();

  const handleSignIn = async () => {
    const redirectUrl = new URL("/auth/callback", location.origin);
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
