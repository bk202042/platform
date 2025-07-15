'use client';

import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  children: React.ReactNode;
}

export default function GoogleSignInButton({ children }: GoogleSignInButtonProps) {
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
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
