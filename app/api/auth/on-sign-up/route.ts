import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user } = await req.json();

    if (!user) {
      return NextResponse.json({ error: 'User data is missing' }, { status: 400 });
    }

    const supabase = await createClient();

    // Robustly parse the full_name
    const fullName = user.raw_user_meta_data?.full_name || '';
    const names = fullName.split(' ').filter(Boolean);
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    const { error } = await supabase.from('profiles').insert([
      {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: user.raw_user_meta_data?.avatar_url,
        role: 'user',
      },
    ]);

    if (error) {
      console.error('Error creating user profile:', error);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User profile created successfully' });
  } catch (error) {
    console.error('Unexpected error in on-sign-up hook:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
