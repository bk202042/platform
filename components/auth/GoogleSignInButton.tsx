'use client';

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
    <Button onClick={handleSignIn} className="w-full">
      {children}
    </Button>
  );
}
