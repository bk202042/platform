import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileDetails from './_components/ProfileDetails';

export const metadata = {
  title: '관리자 프로필 | Vietnam Property Platform',
  description: '관리자 계정 정보 관리 및 설정',
};

export default async function AdminProfilePage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const user = session.user;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">관리자 프로필</h1>
      <ProfileDetails user={user} />
    </div>
  );
}